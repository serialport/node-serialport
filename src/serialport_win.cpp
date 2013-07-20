#include "serialport.h"
#include <list>
#include "win/disphelper.h"

#include "win/stdafx.h"
#include "win/enumser.h"

#ifdef WIN32

#define MAX_BUFFER_SIZE 1000

// Declare type of pointer to CancelIoEx function
typedef BOOL (WINAPI *CancelIoExType)(HANDLE hFile, LPOVERLAPPED lpOverlapped);


std::list<int> g_closingHandles;
int bufferSize;
void ErrorCodeToString(const char* prefix, int errorCode, char *errorStr) {
  switch(errorCode) {
  case ERROR_FILE_NOT_FOUND:
    _snprintf(errorStr, sizeof(errorStr), "%s: File not found", prefix);
    break;
  case ERROR_INVALID_HANDLE:
    _snprintf(errorStr, sizeof(errorStr), "%s: Invalid handle", prefix);
    break;
  case ERROR_ACCESS_DENIED:
    _snprintf(errorStr, sizeof(errorStr), "%s: Access denied", prefix);
    break;
  case ERROR_OPERATION_ABORTED:
    _snprintf(errorStr, sizeof(errorStr), "%s: operation aborted", prefix);
    break;
  default:
    _snprintf(errorStr, sizeof(errorStr), "%s: Unknown error code %d", prefix, errorCode);
    break;
  }
}

void EIO_Open(uv_work_t* req) {
  OpenBaton* data = static_cast<OpenBaton*>(req->data);

  HANDLE file = CreateFile(
    data->path,
    GENERIC_READ | GENERIC_WRITE,
    0,
    NULL,
    OPEN_EXISTING,
    FILE_FLAG_OVERLAPPED,
    NULL);
  if (file == INVALID_HANDLE_VALUE) {
    DWORD errorCode = GetLastError();
    char temp[100];
    _snprintf(temp, sizeof(temp), "Opening %s", data->path);
    ErrorCodeToString(temp, errorCode, data->errorString);
    return;
  }

  bufferSize = data->bufferSize;
  if(bufferSize > MAX_BUFFER_SIZE) {
    bufferSize = MAX_BUFFER_SIZE;
  }

  DCB dcb = { 0 };
  dcb.DCBlength = sizeof(DCB);
  if(!BuildCommDCB("9600,n,8,1", &dcb)) {
    ErrorCodeToString("BuildCommDCB", GetLastError(), data->errorString);
    return;
  }

  dcb.fBinary = true;
  dcb.BaudRate = data->baudRate;
  dcb.ByteSize = data->dataBits;
  switch(data->parity) {
  case SERIALPORT_PARITY_NONE:
    dcb.Parity = NOPARITY;
    break;
  case SERIALPORT_PARITY_MARK:
    dcb.Parity = MARKPARITY;
    break;
  case SERIALPORT_PARITY_EVEN:
    dcb.Parity = EVENPARITY;
    break;
  case SERIALPORT_PARITY_ODD:
    dcb.Parity = ODDPARITY;
    break;
  case SERIALPORT_PARITY_SPACE:
    dcb.Parity = SPACEPARITY;
    break;
  }
  switch(data->stopBits) {
  case SERIALPORT_STOPBITS_ONE:
    dcb.StopBits = ONESTOPBIT;
    break;
  case SERIALPORT_STOPBITS_ONE_FIVE:
    dcb.StopBits = ONE5STOPBITS;
    break;
  case SERIALPORT_STOPBITS_TWO:
    dcb.StopBits = TWOSTOPBITS;
    break;
  }

  if(!SetCommState(file, &dcb)) {
    ErrorCodeToString("SetCommState", GetLastError(), data->errorString);
    return;
  }

  // Set the com port read/write timeouts
  DWORD serialBitsPerByte = 8/*std data bits*/ + 1/*start bit*/;
  serialBitsPerByte += (data->parity   == SERIALPORT_PARITY_NONE ) ? 0 : 1;
  serialBitsPerByte += (data->stopBits == SERIALPORT_STOPBITS_ONE) ? 1 : 2;
  DWORD msPerByte = (data->baudRate > 0) ?
                    ((1000 * serialBitsPerByte + data->baudRate - 1) / data->baudRate) :
                    1;
  if (msPerByte < 1) {
    msPerByte = 1;
  }
  COMMTIMEOUTS commTimeouts = {0};
  commTimeouts.ReadIntervalTimeout = msPerByte; // Minimize chance of concatenating of separate serial port packets on read
  commTimeouts.ReadTotalTimeoutMultiplier  = 0; // Do not allow big read timeout when big read buffer used
  commTimeouts.ReadTotalTimeoutConstant    = 1000; // Total read timeout (period of read loop)
  commTimeouts.WriteTotalTimeoutConstant   = 1000; // Const part of write timeout
  commTimeouts.WriteTotalTimeoutMultiplier = msPerByte; // Variable part of write timeout (per byte)
  if(!SetCommTimeouts(file, &commTimeouts)) {
    ErrorCodeToString("SetCommTimeouts", GetLastError(), data->errorString);
    return;
  }

  // Remove garbage data in RX/TX queues
  PurgeComm(file, PURGE_RXCLEAR); 
  PurgeComm(file, PURGE_TXCLEAR);

  data->result = (int)file;
}

struct WatchPortBaton {
public:
  HANDLE fd;
  DWORD bytesRead;
  char buffer[MAX_BUFFER_SIZE];
  char errorString[1000];
  DWORD errorCode;
  bool disconnected;
  v8::Persistent<v8::Value> dataCallback;
  v8::Persistent<v8::Value> errorCallback;
  v8::Persistent<v8::Value> disconnectedCallback;
};

void EIO_WatchPort(uv_work_t* req) {
  WatchPortBaton* data = static_cast<WatchPortBaton*>(req->data);
  data->bytesRead = 0;
  data->disconnected = false;

  // Event used by GetOverlappedResult(..., TRUE) to wait for incoming data or timeout
  // Event MUST be used if program has several simultaneous asynchronous operations
  // on the same handle (i.e. ReadFile and WriteFile)
  HANDLE hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);

  while(true) {
    OVERLAPPED ov = {0};
    ov.hEvent = hEvent;

    // Start read operation - synchrounous or asynchronous
    DWORD bytesReadSync = 0;
    if(!ReadFile((HANDLE)data->fd, data->buffer, bufferSize, &bytesReadSync, &ov)) {
      data->errorCode = GetLastError();
      if(data->errorCode != ERROR_IO_PENDING) {
        // Read operation error
        if(data->errorCode == ERROR_OPERATION_ABORTED) {
          data->disconnected = true;
        }
        else {
          ErrorCodeToString("Reading from COM port (ReadFile)", data->errorCode, data->errorString);
        }
        break;
      }

      // Read operation is asynchronous and is pending
      // We MUST wait for operation completion before deallocation of OVERLAPPED struct
      // or read data buffer

      // Wait for async read operation completion or timeout
      DWORD bytesReadAsync = 0;
      if(!GetOverlappedResult((HANDLE)data->fd, &ov, &bytesReadAsync, TRUE)) {
        // Read operation error
        data->errorCode = GetLastError();
        if(data->errorCode == ERROR_OPERATION_ABORTED) {
          data->disconnected = true;
        }
        else {
          ErrorCodeToString("Reading from COM port (GetOverlappedResult)", data->errorCode, data->errorString);
        }
        break;
      }
      else {
        // Read operation completed asynchronously
        data->bytesRead = bytesReadAsync;
      }
    }
    else {
      // Read operation completed synchronously
      data->bytesRead = bytesReadSync;
    }

    // Return data received if any
    if(data->bytesRead > 0) {
      break;
    }
  }

  CloseHandle(hEvent);
}

bool IsClosingHandle(int fd) {
  for(std::list<int>::iterator it=g_closingHandles.begin(); it!=g_closingHandles.end(); ++it) {
    if(fd == *it) {
      g_closingHandles.remove(fd);
      return true;
    }
  }
  return false;
}

void EIO_AfterWatchPort(uv_work_t* req) {
  WatchPortBaton* data = static_cast<WatchPortBaton*>(req->data);
  if(data->disconnected) {
    v8::Handle<v8::Value> argv[1];
    v8::Function::Cast(*data->disconnectedCallback)->Call(v8::Context::GetCurrent()->Global(), 0, argv);
    goto cleanup;
  }

  if(data->bytesRead > 0) {
    v8::Handle<v8::Value> argv[1];
    argv[0] = node::Buffer::New(data->buffer, data->bytesRead)->handle_;
    v8::Function::Cast(*data->dataCallback)->Call(v8::Context::GetCurrent()->Global(), 1, argv);
  } else if(data->errorCode > 0) {
    if(data->errorCode == ERROR_INVALID_HANDLE && IsClosingHandle((int)data->fd)) {
      goto cleanup;
    } else {
      v8::Handle<v8::Value> argv[1];
      argv[0] = v8::Exception::Error(v8::String::New(data->errorString));
      v8::Function::Cast(*data->errorCallback)->Call(v8::Context::GetCurrent()->Global(), 1, argv);
      Sleep(100); // prevent the errors from occurring too fast
    }
  }
  AfterOpenSuccess((int)data->fd, data->dataCallback, data->disconnectedCallback, data->errorCallback);

cleanup:
  data->dataCallback.Dispose();
  data->errorCallback.Dispose();
  delete data;
  delete req;
}

void AfterOpenSuccess(int fd, v8::Handle<v8::Value> dataCallback, v8::Handle<v8::Value> disconnectedCallback, v8::Handle<v8::Value> errorCallback) {
  WatchPortBaton* baton = new WatchPortBaton();
  memset(baton, 0, sizeof(WatchPortBaton));
  baton->fd = (HANDLE)fd;
  baton->dataCallback = v8::Persistent<v8::Value>::New(dataCallback);
  baton->errorCallback = v8::Persistent<v8::Value>::New(errorCallback);
  baton->disconnectedCallback = v8::Persistent<v8::Value>::New(disconnectedCallback);

  uv_work_t* req = new uv_work_t();
  req->data = baton;

  uv_queue_work(uv_default_loop(), req, EIO_WatchPort, (uv_after_work_cb)EIO_AfterWatchPort);
}

void EIO_Write(uv_work_t* req) {
  QueuedWrite* queuedWrite = static_cast<QueuedWrite*>(req->data);
  WriteBaton* data = static_cast<WriteBaton*>(queuedWrite->baton);
  data->result = 0;

  OVERLAPPED ov = {0};
  // Event used by GetOverlappedResult(..., TRUE) to wait for outgoing data or timeout
  // Event MUST be used if program has several simultaneous asynchronous operations
  // on the same handle (i.e. ReadFile and WriteFile)
  ov.hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);

  // Start write operation - synchrounous or asynchronous
  DWORD bytesWrittenSync = 0;
  if(!WriteFile((HANDLE)data->fd, data->bufferData, static_cast<DWORD>(data->bufferLength), &bytesWrittenSync, &ov)) {
    DWORD lastError = GetLastError();
    if(lastError != ERROR_IO_PENDING) {
      // Write operation error
      ErrorCodeToString("Writing to COM port (WriteFile)", lastError, data->errorString);
    }
    else {
      // Write operation is asynchronous and is pending
      // We MUST wait for operation completion before deallocation of OVERLAPPED struct
      // or write data buffer

      // Wait for async write operation completion or timeout
      DWORD bytesWrittenAsync = 0;
      if(!GetOverlappedResult((HANDLE)data->fd, &ov, &bytesWrittenAsync, TRUE)) {
        // Write operation error
        DWORD lastError = GetLastError();
        ErrorCodeToString("Writing to COM port (GetOverlappedResult)", lastError, data->errorString);
      }
      else {
        // Write operation completed asynchronously
        data->result = bytesWrittenAsync;
      }
    }
  }
  else {
    // Write operation completed synchronously
    data->result = bytesWrittenSync;
  }

  CloseHandle(ov.hEvent);
}

void EIO_Close(uv_work_t* req) {
  CloseBaton* data = static_cast<CloseBaton*>(req->data);

  g_closingHandles.push_back(data->fd);

  HMODULE hKernel32 = LoadLibrary("kernel32.dll");
  // Look up function address
  CancelIoExType pCancelIoEx = (CancelIoExType)GetProcAddress(hKernel32, "CancelIoEx");
  // Do something with it
  if (pCancelIoEx)
  {
      // Function exists so call it
      // Cancel all pending IO Requests for the current device
      pCancelIoEx((HANDLE)data->fd, NULL);
  }
  if(!CloseHandle((HANDLE)data->fd)) {
    ErrorCodeToString("closing connection", GetLastError(), data->errorString);
    return;
  }
}

/*
 * listComPorts.c -- list COM ports
 *
 * http://github.com/todbot/usbSearch/
 *
 * 2012, Tod E. Kurt, http://todbot.com/blog/
 *
 *
 * Uses DispHealper : http://disphelper.sourceforge.net/
 *
 * Notable VIDs & PIDs combos:
 * VID 0403 - FTDI
 * 
 * VID 0403 / PID 6001 - Arduino Diecimila
 *
 */
void EIO_List(uv_work_t* req) {
  ListBaton* data = static_cast<ListBaton*>(req->data);

  {
    DISPATCH_OBJ(wmiSvc);
    DISPATCH_OBJ(colDevices);

    dhInitialize(TRUE);
    dhToggleExceptions(FALSE);
   
    dhGetObject(L"winmgmts:{impersonationLevel=impersonate}!\\\\.\\root\\cimv2", NULL, &wmiSvc);
    dhGetValue(L"%o", &colDevices, wmiSvc, L".ExecQuery(%S)", L"Select * from Win32_PnPEntity");

    int port_count = 0;
    FOR_EACH(objDevice, colDevices, NULL) {
      char* name = NULL;
      char* pnpid = NULL;
      char* manu = NULL;
      char* match;

      dhGetValue(L"%s", &name,  objDevice, L".Name");
      dhGetValue(L"%s", &pnpid, objDevice, L".PnPDeviceID");
                                                  
      if( name != NULL && ((match = strstr( name, "(COM" )) != NULL) ) { // look for "(COM23)"
        // 'Manufacturuer' can be null, so only get it if we need it
        dhGetValue(L"%s", &manu, objDevice,  L".Manufacturer");
        port_count++;
        char* comname = strtok( match, "()");
        ListResultItem* resultItem = new ListResultItem();
        resultItem->comName = comname;
        resultItem->manufacturer = manu;
        resultItem->pnpId = pnpid;
        data->results.push_back(resultItem);
        dhFreeString(manu);
      }
          
      dhFreeString(name);
      dhFreeString(pnpid);
    } NEXT(objDevice);
      
    SAFE_RELEASE(colDevices);
    SAFE_RELEASE(wmiSvc);
      
    dhUninitialize(TRUE);
  }

  std::vector<UINT> ports;
  if (CEnumerateSerial::UsingQueryDosDevice(ports))
  {
    for (size_t i = 0; i < ports.size(); i++)
    {
      char comname[64] = { 0 };
      _snprintf(comname, sizeof(comname), "COM%u", ports[i]);
      bool bFound = false;
      for (std::list<ListResultItem*>::iterator ri = data->results.begin(); ri != data->results.end(); ++ri)
      {
        if (stricmp((*ri)->comName.c_str(), comname) == 0)
        {
          bFound = true;
          break;
        }
      }
      if (!bFound)
      {
        ListResultItem* resultItem = new ListResultItem();
        resultItem->comName = comname;
        resultItem->manufacturer = "";
        resultItem->pnpId = "";
        data->results.push_back(resultItem);
      }
    }
  }
}

void EIO_Flush(uv_work_t* req) {
  FlushBaton* data = static_cast<FlushBaton*>(req->data);

  if(!FlushFileBuffers((HANDLE)data->fd)) {
    ErrorCodeToString("flushing connection", GetLastError(), data->errorString);
    return;
  }
}

#endif
