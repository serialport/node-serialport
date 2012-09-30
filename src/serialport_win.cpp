
#include "serialport.h"
#include <list>
#include "win/disphelper.h"

#ifdef WIN32

std::list<int> g_closingHandles;
int bufferSize;
void ErrorCodeToString(const char* prefix, int errorCode, char *errorStr) {
  switch(errorCode) {
  case ERROR_FILE_NOT_FOUND:
    sprintf(errorStr, "%s: File not found", prefix);
    break;
  case ERROR_INVALID_HANDLE:
    sprintf(errorStr, "%s: Invalid handle", prefix);
    break;
  case ERROR_ACCESS_DENIED:
    sprintf(errorStr, "%s: Access denied", prefix);
    break;
  case ERROR_OPERATION_ABORTED:
    sprintf(errorStr, "%s: operation aborted", prefix);
    break;
  default:
    sprintf(errorStr, "%s: Unknown error code %d", prefix, errorCode);
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
    char temp[100];
    sprintf(temp, "Opening %s", data->path);
    ErrorCodeToString(temp, GetLastError(), data->errorString);
    return;
  }

  bufferSize = data->bufferSize;

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

  // set the com port to return immediatly after a read
  COMMTIMEOUTS commTimeouts = {0};
  commTimeouts.ReadIntervalTimeout = MAXDWORD;
  commTimeouts.ReadTotalTimeoutMultiplier = MAXDWORD;
  commTimeouts.ReadTotalTimeoutConstant = 1000;
  commTimeouts.WriteTotalTimeoutConstant = 1000;
  commTimeouts.WriteTotalTimeoutMultiplier = 1000;
  if(!SetCommTimeouts(file, &commTimeouts)) {
    ErrorCodeToString("SetCommTimeouts", GetLastError(), data->errorString);
    return;
  }

  data->result = (int)file;
}

struct WatchPortBaton {
public:
  HANDLE fd;
  DWORD bytesRead;
  char buffer[100];
  char errorString[1000];
  DWORD errorCode;
  bool disconnected;
  v8::Persistent<v8::Value> dataCallback;
  v8::Persistent<v8::Value> errorCallback;
  v8::Persistent<v8::Value> disconnectedCallback;
};

void EIO_WatchPort(uv_work_t* req) {
  WatchPortBaton* data = static_cast<WatchPortBaton*>(req->data);
  data->disconnected = false;

  while(true){
    OVERLAPPED ov = {0};
	memset(&ov, 0, sizeof(ov));
    ov.hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);
    
    if(!ReadFile(data->fd, data->buffer, bufferSize, &data->bytesRead, &ov)) {
      data->errorCode = GetLastError();
      if(data->errorCode == ERROR_OPERATION_ABORTED) {
        data->disconnected = true;
        CloseHandle(ov.hEvent);
        return;
      }
      if(data->errorCode != ERROR_IO_PENDING) {
        ErrorCodeToString("Reading from COM port (ReadFile)", GetLastError(), data->errorString);
        CloseHandle(ov.hEvent);
        return;
      }

      DWORD waitResult = WaitForSingleObject(ov.hEvent, 1000);
      if(waitResult == WAIT_TIMEOUT) {
        CancelIo(data->fd);
		CloseHandle(ov.hEvent);
        data->bytesRead = 0;
        data->errorCode = 0;
        return;
      }
      if(waitResult != WAIT_OBJECT_0) {
        DWORD lastError = GetLastError();
        ErrorCodeToString("Reading from COM port (WaitForSingleObject)", lastError, data->errorString);
		CloseHandle(ov.hEvent);
        return;
      }

      if(!GetOverlappedResult((HANDLE)data->fd, &ov, &data->bytesRead, TRUE)) {
		CloseHandle(ov.hEvent);
        DWORD lastError = GetLastError();
        if(lastError == ERROR_OPERATION_ABORTED) {
          data->disconnected = true;
          return;
        }
        ErrorCodeToString("Reading from COM port (GetOverlappedResult)", lastError, data->errorString);
        return;
      }
    }
    CloseHandle(ov.hEvent);
    if(data->bytesRead > 0) {
      return;
    }
  }
}

bool IsClosingHandle(int fd) {
  for(std::list<int>::iterator it=g_closingHandles.begin(); it!=g_closingHandles.end(); it++) {
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

  uv_queue_work(uv_default_loop(), req, EIO_WatchPort, EIO_AfterWatchPort);
}

void EIO_Write(uv_work_t* req) {
  QueuedWrite* queuedWrite = static_cast<QueuedWrite*>(req->data);
  WriteBaton* data = static_cast<WriteBaton*>(queuedWrite->baton);

  OVERLAPPED ov = {0};
  memset(&ov, 0, sizeof(ov));
  ov.hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);

  DWORD bytesWritten;
  if(!WriteFile((HANDLE)data->fd, data->bufferData, data->bufferLength, &bytesWritten, &ov)) {
    DWORD lastError = GetLastError();
    if(lastError != ERROR_IO_PENDING) {
      ErrorCodeToString("Writing to COM port (WriteFile)", lastError, data->errorString);
      CloseHandle(ov.hEvent);
      return;
    }

    if(WaitForSingleObject(ov.hEvent, 1000) != WAIT_OBJECT_0) {
      DWORD lastError = GetLastError();
      ErrorCodeToString("Writing to COM port (WaitForSingleObject)", lastError, data->errorString);
      CloseHandle(ov.hEvent);
      return;
    }

    if(!GetOverlappedResult((HANDLE)data->fd, &ov, &bytesWritten, TRUE)) {
      DWORD lastError = GetLastError();
      ErrorCodeToString("Writing to COM port (GetOverlappedResult)", lastError, data->errorString);
      CloseHandle(ov.hEvent);
      return;
    }
  }

  CloseHandle(ov.hEvent);

  data->result = bytesWritten;
}

void EIO_Close(uv_work_t* req) {
  CloseBaton* data = static_cast<CloseBaton*>(req->data);

  g_closingHandles.push_back(data->fd);
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

  DISPATCH_OBJ(wmiSvc);
  DISPATCH_OBJ(colDevices);

  dhInitialize(TRUE);
  dhToggleExceptions(TRUE);
 
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
                                                
    if( (match = strstr( name, "(COM" )) != NULL ) { // look for "(COM23)"
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

void EIO_Flush(uv_work_t* req) {
  FlushBaton* data = static_cast<FlushBaton*>(req->data);

  if(!FlushFileBuffers((HANDLE)data->fd)) {
    ErrorCodeToString("flushing connection", GetLastError(), data->errorString);
    return;
  }
}

#endif
