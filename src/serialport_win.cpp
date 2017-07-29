#include "./serialport.h"
#include "./serialport_win.h"
#include <nan.h>
#include <list>
#include <vector>
#include <string.h>
#include <windows.h>
#include <Setupapi.h>
#include <devguid.h>
#pragma comment (lib, "setupapi.lib")

#define MAX_BUFFER_SIZE 1000

// Declare type of pointer to CancelIoEx function
typedef BOOL (WINAPI *CancelIoExType)(HANDLE hFile, LPOVERLAPPED lpOverlapped);

std::list<int> g_closingHandles;

void ErrorCodeToString(const char* prefix, int errorCode, char *errorStr) {
  switch (errorCode) {
  case ERROR_FILE_NOT_FOUND:
    _snprintf_s(errorStr, ERROR_STRING_SIZE, _TRUNCATE, "%s: File not found", prefix);
    break;
  case ERROR_INVALID_HANDLE:
    _snprintf_s(errorStr, ERROR_STRING_SIZE, _TRUNCATE, "%s: Invalid handle", prefix);
    break;
  case ERROR_ACCESS_DENIED:
    _snprintf_s(errorStr, ERROR_STRING_SIZE, _TRUNCATE, "%s: Access denied", prefix);
    break;
  case ERROR_OPERATION_ABORTED:
    _snprintf_s(errorStr, ERROR_STRING_SIZE, _TRUNCATE, "%s: Operation aborted", prefix);
    break;
  default:
    _snprintf_s(errorStr, ERROR_STRING_SIZE, _TRUNCATE, "%s: Unknown error code %d", prefix, errorCode);
    break;
  }
}

void EIO_Open(uv_work_t* req) {
  OpenBaton* data = static_cast<OpenBaton*>(req->data);

  char originalPath[1024];
  strncpy_s(originalPath, sizeof(originalPath), data->path, _TRUNCATE);
  // data->path is char[1024] but on Windows it has the form "COMx\0" or "COMxx\0"
  // We want to prepend "\\\\.\\" to it before we call CreateFile
  strncpy(data->path + 20, data->path, 10);
  strncpy(data->path, "\\\\.\\", 4);
  strncpy(data->path + 4, data->path + 20, 10);

  int shareMode = FILE_SHARE_READ | FILE_SHARE_WRITE;
  if (data->lock) {
    shareMode = 0;
  }

  HANDLE file = CreateFile(
    data->path,
    GENERIC_READ | GENERIC_WRITE,
    shareMode,  // dwShareMode 0 Prevents other processes from opening if they request delete, read, or write access
    NULL,
    OPEN_EXISTING,
    FILE_FLAG_OVERLAPPED,  // allows for reading and writing at the same time and sets the handle for asynchronous I/O
    NULL
  );

  if (file == INVALID_HANDLE_VALUE) {
    DWORD errorCode = GetLastError();
    char temp[100];
    _snprintf_s(temp, sizeof(temp), _TRUNCATE, "Opening %s", originalPath);
    ErrorCodeToString(temp, errorCode, data->errorString);
    return;
  }

  DCB dcb = { 0 };
  SecureZeroMemory(&dcb, sizeof(DCB));
  dcb.DCBlength = sizeof(DCB);

  if (!GetCommState(file, &dcb)) {
    ErrorCodeToString("Open (GetCommState)", GetLastError(), data->errorString);
    CloseHandle(file);
    return;
  }

  if (data->hupcl) {
    dcb.fDtrControl = DTR_CONTROL_ENABLE;
  } else {
    dcb.fDtrControl = DTR_CONTROL_DISABLE;  // disable DTR to avoid reset
  }

  dcb.Parity = NOPARITY;
  dcb.ByteSize = 8;
  dcb.StopBits = ONESTOPBIT;
  dcb.fInX = FALSE;
  dcb.fOutX = FALSE;
  dcb.fOutxDsrFlow = FALSE;
  dcb.fOutxCtsFlow = FALSE;
  dcb.fRtsControl = RTS_CONTROL_ENABLE;

  dcb.fBinary = true;
  dcb.BaudRate = data->baudRate;
  dcb.ByteSize = data->dataBits;

  switch (data->parity) {
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

  switch (data->stopBits) {
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

  if (!SetCommState(file, &dcb)) {
    ErrorCodeToString("Open (SetCommState)", GetLastError(), data->errorString);
    CloseHandle(file);
    return;
  }

  // Set the timeouts for read and write operations read operation is to return
  // immediately with the bytes that have already been received, even if no bytes
  // have been received.
  COMMTIMEOUTS commTimeouts = {0};
  commTimeouts.ReadIntervalTimeout = MAXDWORD;  // Never timeout
  commTimeouts.ReadTotalTimeoutMultiplier = 0;  // Do not allow big read timeout when big read buffer used
  commTimeouts.ReadTotalTimeoutConstant = 0;    // Total read timeout (period of read loop)
  commTimeouts.WriteTotalTimeoutConstant = 0;   // Const part of write timeout
  commTimeouts.WriteTotalTimeoutMultiplier = 0; // Variable part of write timeout (per byte)

  if (!SetCommTimeouts(file, &commTimeouts)) {
    ErrorCodeToString("Open (SetCommTimeouts)", GetLastError(), data->errorString);
    CloseHandle(file);
    return;
  }

  // Remove garbage data in RX/TX queues
  PurgeComm(file, PURGE_RXCLEAR);
  PurgeComm(file, PURGE_TXCLEAR);

  data->result = (int)file;
}

void EIO_Update(uv_work_t* req) {
  ConnectionOptionsBaton* data = static_cast<ConnectionOptionsBaton*>(req->data);

  DCB dcb = { 0 };
  SecureZeroMemory(&dcb, sizeof(DCB));
  dcb.DCBlength = sizeof(DCB);

  if (!GetCommState((HANDLE)data->fd, &dcb)) {
    ErrorCodeToString("Update (GetCommState)", GetLastError(), data->errorString);
    return;
  }

  dcb.BaudRate = data->baudRate;

  if (!SetCommState((HANDLE)data->fd, &dcb)) {
    ErrorCodeToString("Update (SetCommState)", GetLastError(), data->errorString);
    return;
  }
}

void EIO_Set(uv_work_t* req) {
  SetBaton* data = static_cast<SetBaton*>(req->data);

  if (data->rts) {
    EscapeCommFunction((HANDLE)data->fd, SETRTS);
  } else {
    EscapeCommFunction((HANDLE)data->fd, CLRRTS);
  }

  if (data->dtr) {
    EscapeCommFunction((HANDLE)data->fd, SETDTR);
  } else {
    EscapeCommFunction((HANDLE)data->fd, CLRDTR);
  }

  if (data->brk) {
    EscapeCommFunction((HANDLE)data->fd, SETBREAK);
  } else {
    EscapeCommFunction((HANDLE)data->fd, CLRBREAK);
  }

  DWORD bits = 0;

  GetCommMask((HANDLE)data->fd, &bits);

  bits &= ~(EV_CTS | EV_DSR);

  if (data->cts) {
    bits |= EV_CTS;
  }

  if (data->dsr) {
    bits |= EV_DSR;
  }

  if (!SetCommMask((HANDLE)data->fd, bits)) {
    ErrorCodeToString("Setting options on COM port (SetCommMask)", GetLastError(), data->errorString);
    return;
  }
}

void EIO_Get(uv_work_t* req) {
  GetBaton* data = static_cast<GetBaton*>(req->data);

  DWORD bits = 0;
  if (!GetCommModemStatus((HANDLE)data->fd, &bits)) {
    ErrorCodeToString("Getting control settings on COM port (GetCommModemStatus)", GetLastError(), data->errorString);
    return;
  }

  data->cts = bits & MS_CTS_ON;
  data->dsr = bits & MS_DSR_ON;
  data->dcd = bits & MS_RLSD_ON;
}

bool IsClosingHandle(int fd) {
  for (std::list<int>::iterator it = g_closingHandles.begin(); it != g_closingHandles.end(); ++it) {
    if (fd == *it) {
      g_closingHandles.remove(fd);
      return true;
    }
  }
  return false;
}

NAN_METHOD(Write) {
  // file descriptor
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("First argument must be an int");
    return;
  }
  int fd = Nan::To<int>(info[0]).FromJust();

  // buffer
  if (!info[1]->IsObject() || !node::Buffer::HasInstance(info[1])) {
    Nan::ThrowTypeError("Second argument must be a buffer");
    return;
  }
  v8::Local<v8::Object> buffer = info[1]->ToObject();
  char* bufferData = node::Buffer::Data(buffer);
  size_t bufferLength = node::Buffer::Length(buffer);

  // callback
  if (!info[2]->IsFunction()) {
    Nan::ThrowTypeError("Third argument must be a function");
    return;
  }

  WriteBaton* baton = new WriteBaton();
  memset(baton, 0, sizeof(WriteBaton));
  baton->fd = fd;
  baton->buffer.Reset(buffer);
  baton->bufferData = bufferData;
  baton->bufferLength = bufferLength;
  baton->offset = 0;
  baton->callback.Reset(info[2].As<v8::Function>());

  uv_work_t* req = new uv_work_t();
  req->data = baton;

  uv_queue_work(uv_default_loop(), req, EIO_Write, (uv_after_work_cb)EIO_AfterWrite);
}

void EIO_Write(uv_work_t* req) {
  WriteBaton* data = static_cast<WriteBaton*>(req->data);
  data->result = 0;

  do {
    OVERLAPPED ov = {0};
    // Event used by GetOverlappedResult(..., TRUE) to wait for outgoing data or timeout
    // Event MUST be used if program has several simultaneous asynchronous operations
    // on the same handle (i.e. ReadFile and WriteFile)
    ov.hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);

    // Start write operation - synchronous or asynchronous
    DWORD bytesWritten = 0;
    if (!WriteFile((HANDLE)data->fd, data->bufferData, static_cast<DWORD>(data->bufferLength), &bytesWritten, &ov)) {
      DWORD lastError = GetLastError();
      if (lastError != ERROR_IO_PENDING) {
        // Write operation error
        ErrorCodeToString("Writing to COM port (WriteFile)", lastError, data->errorString);
        CloseHandle(ov.hEvent);
        return;
      }
      // Write operation is completing asynchronously
      // We MUST wait for the operation completion before deallocation of OVERLAPPED struct
      // or write data buffer

      // block for async write operation completion
      bytesWritten = 0;
      if (!GetOverlappedResult((HANDLE)data->fd, &ov, &bytesWritten, TRUE)) {
        // Write operation error
        DWORD lastError = GetLastError();
        ErrorCodeToString("Writing to COM port (GetOverlappedResult)", lastError, data->errorString);
        CloseHandle(ov.hEvent);
        return;
      }
    }
    // Write operation completed synchronously
    data->result = bytesWritten;
    data->offset += data->result;
    CloseHandle(ov.hEvent);
  } while (data->bufferLength > data->offset);
}

void EIO_AfterWrite(uv_work_t* req) {
  Nan::HandleScope scope;
  WriteBaton* baton = static_cast<WriteBaton*>(req->data);
  delete req;

  v8::Local<v8::Value> argv[1];
  if (baton->errorString[0]) {
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(baton->errorString).ToLocalChecked());
  } else {
    argv[0] = Nan::Null();
  }
  baton->callback.Call(1, argv);
  delete baton;
}

NAN_METHOD(Read) {
  // file descriptor
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("First argument must be a fd");
    return;
  }
  int fd = Nan::To<int>(info[0]).FromJust();

  // buffer
  if (!info[1]->IsObject() || !node::Buffer::HasInstance(info[1])) {
    Nan::ThrowTypeError("Second argument must be a buffer");
    return;
  }
  v8::Local<v8::Object> buffer = info[1]->ToObject();
  size_t bufferLength = node::Buffer::Length(buffer);

  // offset
  if (!info[2]->IsInt32()) {
    Nan::ThrowTypeError("Third argument must be an int");
    return;
  }
  int offset = Nan::To<v8::Int32>(info[2]).ToLocalChecked()->Value();

  // bytes to read
  if (!info[3]->IsInt32()) {
    Nan::ThrowTypeError("Fourth argument must be an int");
    return;
  }
  size_t bytesToRead = Nan::To<v8::Int32>(info[3]).ToLocalChecked()->Value();

  if ((bytesToRead + offset) > bufferLength) {
    Nan::ThrowTypeError("'bytesToRead' + 'offset' cannot be larger than the buffer's length");
    return;
  }

  // callback
  if (!info[4]->IsFunction()) {
    Nan::ThrowTypeError("Fifth argument must be a function");
    return;
  }

  ReadBaton* baton = new ReadBaton();
  memset(baton, 0, sizeof(ReadBaton));
  baton->fd = fd;
  baton->offset = offset;
  baton->bytesToRead = bytesToRead;
  baton->bufferLength = bufferLength;
  baton->bufferData = node::Buffer::Data(buffer);
  baton->callback.Reset(info[4].As<v8::Function>());

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Read, (uv_after_work_cb)EIO_AfterRead);
}

void EIO_Read(uv_work_t* req) {
  ReadBaton* data = static_cast<ReadBaton*>(req->data);
  data->bytesRead = 0;
  int errorCode = ERROR_SUCCESS;

  char* offsetPtr = data->bufferData;
  offsetPtr += data->offset;

  // Event used by GetOverlappedResult(..., TRUE) to wait for incoming data or timeout
  // Event MUST be used if program has several simultaneous asynchronous operations
  // on the same handle (i.e. ReadFile and WriteFile)
  HANDLE hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);

  while (true) {
    OVERLAPPED ov = {0};
    ov.hEvent = hEvent;

    // Start read operation - synchrounous or asynchronous
    DWORD bytesReadSync = 0;
    if (!ReadFile((HANDLE)data->fd, offsetPtr, data->bytesToRead, &bytesReadSync, &ov)) {
      errorCode = GetLastError();
      if (errorCode != ERROR_IO_PENDING) {
        // Read operation error
        if (errorCode == ERROR_OPERATION_ABORTED) {
        } else {
          ErrorCodeToString("Reading from COM port (ReadFile)", errorCode, data->errorString);
          CloseHandle(hEvent);
          return;
        }
        break;
      }

      // Read operation is asynchronous and is pending
      // We MUST wait for operation completion before deallocation of OVERLAPPED struct
      // or read data buffer

      // Wait for async read operation completion or timeout
      DWORD bytesReadAsync = 0;
      if (!GetOverlappedResult((HANDLE)data->fd, &ov, &bytesReadAsync, TRUE)) {
        // Read operation error
        errorCode = GetLastError();
        if (errorCode == ERROR_OPERATION_ABORTED) {
        } else {
          ErrorCodeToString("Reading from COM port (GetOverlappedResult)", errorCode, data->errorString);
          CloseHandle(hEvent);
          return;
        }
        break;
      } else {
        // Read operation completed asynchronously
        data->bytesRead = bytesReadAsync;
      }
    } else {
      // Read operation completed synchronously
      data->bytesRead = bytesReadSync;
    }

    // Return data received if any
    if (data->bytesRead > 0) {
      break;
    }
  }

  CloseHandle(hEvent);
}

void EIO_AfterRead(uv_work_t* req) {
  Nan::HandleScope scope;
  ReadBaton* baton = static_cast<ReadBaton*>(req->data);
  delete req;

  v8::Local<v8::Value> argv[2];
  if (baton->errorString[0]) {
    argv[0] = Nan::Error(baton->errorString);
    argv[1] = Nan::Undefined();
  } else {
    argv[0] = Nan::Null();
    argv[1] = Nan::New<v8::Integer>((int)baton->bytesRead);
  }

  baton->callback.Call(2, argv);
  delete baton;
}

void EIO_Close(uv_work_t* req) {
  VoidBaton* data = static_cast<VoidBaton*>(req->data);

  g_closingHandles.push_back(data->fd);

  HMODULE hKernel32 = LoadLibrary("kernel32.dll");
  // Look up function address
  CancelIoExType pCancelIoEx = (CancelIoExType)GetProcAddress(hKernel32, "CancelIoEx");
  // Do something with it
  if (pCancelIoEx) {
    // Function exists so call it
    // Cancel all pending IO Requests for the current device
    pCancelIoEx((HANDLE)data->fd, NULL);
  }
  if (!CloseHandle((HANDLE)data->fd)) {
    ErrorCodeToString("Closing connection (CloseHandle)", GetLastError(), data->errorString);
    return;
  }
}

char *copySubstring(char *someString, int n)
{
  char *new_ = (char*)malloc(sizeof(char)*n + 1);
  strncpy_s(new_, n + 1, someString, n);
  new_[n] = '\0';
  return new_;
}

NAN_METHOD(List) {
  // callback
  if (!info[0]->IsFunction()) {
    Nan::ThrowTypeError("First argument must be a function");
    return;
  }

  ListBaton* baton = new ListBaton();
  strcpy(baton->errorString, "");
  baton->callback.Reset(info[0].As<v8::Function>());

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_List, (uv_after_work_cb)EIO_AfterList);
}

void EIO_List(uv_work_t* req) {
  ListBaton* data = static_cast<ListBaton*>(req->data);

  GUID *guidDev = (GUID*)& GUID_DEVCLASS_PORTS;
  HDEVINFO hDevInfo = SetupDiGetClassDevs(guidDev, NULL, NULL, DIGCF_PRESENT | DIGCF_PROFILE);
  SP_DEVINFO_DATA deviceInfoData;

  int memberIndex = 0;
  DWORD dwSize, dwPropertyRegDataType;
  char szBuffer[400];
  char *pnpId;
  char *vendorId;
  char *productId;
  char *name;
  char *manufacturer;
  char *locationId;
  bool isCom;
  while (true) {
    pnpId = NULL;
    vendorId = NULL;
    productId = NULL;
    name = NULL;
    manufacturer = NULL;
    locationId = NULL;

    ZeroMemory(&deviceInfoData, sizeof(SP_DEVINFO_DATA));
    deviceInfoData.cbSize = sizeof(SP_DEVINFO_DATA);

    if (SetupDiEnumDeviceInfo(hDevInfo, memberIndex, &deviceInfoData) == FALSE) {
      if (GetLastError() == ERROR_NO_MORE_ITEMS) {
        break;
      }
    }

    dwSize = sizeof(szBuffer);
    SetupDiGetDeviceInstanceId(hDevInfo, &deviceInfoData, szBuffer, dwSize, &dwSize);
    szBuffer[dwSize] = '\0';
    pnpId = strdup(szBuffer);

    vendorId = strstr(szBuffer, "VID_");
    if (vendorId) {
      vendorId += 4;
      vendorId = copySubstring(vendorId, 4);
    }
    productId = strstr(szBuffer, "PID_");
    if (productId) {
      productId += 4;
      productId = copySubstring(productId, 4);
    }

    if (SetupDiGetDeviceRegistryProperty(hDevInfo, &deviceInfoData, SPDRP_LOCATION_INFORMATION, &dwPropertyRegDataType, (BYTE*)szBuffer, sizeof(szBuffer), &dwSize)) {
      locationId = strdup(szBuffer);
    }
    if (SetupDiGetDeviceRegistryProperty(hDevInfo, &deviceInfoData, SPDRP_MFG, &dwPropertyRegDataType, (BYTE*)szBuffer, sizeof(szBuffer), &dwSize)) {
      manufacturer = strdup(szBuffer);
    }

    HKEY hkey = SetupDiOpenDevRegKey(hDevInfo, &deviceInfoData, DICS_FLAG_GLOBAL, 0, DIREG_DEV, KEY_READ);
    if (hkey != INVALID_HANDLE_VALUE) {
      dwSize = sizeof(szBuffer);
      if (RegQueryValueEx(hkey, "PortName", NULL, NULL, (LPBYTE)&szBuffer, &dwSize) == ERROR_SUCCESS) {
        szBuffer[dwSize] = '\0';
        name = strdup(szBuffer);
        isCom = strstr(szBuffer, "COM") != NULL;
      }
    }
    if (isCom) {
      ListResultItem* resultItem = new ListResultItem();
      resultItem->comName = name;
      resultItem->manufacturer = manufacturer;
      resultItem->pnpId = pnpId;
      if (vendorId) {
        resultItem->vendorId = vendorId;
      }
      if (productId) {
        resultItem->productId = productId;
      }
      if (locationId) {
        resultItem->locationId = locationId;
      }
      data->results.push_back(resultItem);
    }
    free(pnpId);
    free(vendorId);
    free(productId);
    free(locationId);
    free(manufacturer);
    free(name);

    RegCloseKey(hkey);
    memberIndex++;
  }
  if (hDevInfo) {
    SetupDiDestroyDeviceInfoList(hDevInfo);
  }
}

void setIfNotEmpty(v8::Local<v8::Object> item, std::string key, const char *value) {
  v8::Local<v8::String> v8key = Nan::New<v8::String>(key).ToLocalChecked();
  if (strlen(value) > 0) {
    Nan::Set(item, v8key, Nan::New<v8::String>(value).ToLocalChecked());
  } else {
    Nan::Set(item, v8key, Nan::Undefined());
  }
}

void EIO_AfterList(uv_work_t* req) {
  Nan::HandleScope scope;

  ListBaton* data = static_cast<ListBaton*>(req->data);

  v8::Local<v8::Value> argv[2];
  if (data->errorString[0]) {
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(data->errorString).ToLocalChecked());
    argv[1] = Nan::Undefined();
  } else {
    v8::Local<v8::Array> results = Nan::New<v8::Array>();
    int i = 0;
    for (std::list<ListResultItem*>::iterator it = data->results.begin(); it != data->results.end(); ++it, i++) {
      v8::Local<v8::Object> item = Nan::New<v8::Object>();

      setIfNotEmpty(item, "comName", (*it)->comName.c_str());
      setIfNotEmpty(item, "manufacturer", (*it)->manufacturer.c_str());
      setIfNotEmpty(item, "serialNumber", (*it)->serialNumber.c_str());
      setIfNotEmpty(item, "pnpId", (*it)->pnpId.c_str());
      setIfNotEmpty(item, "locationId", (*it)->locationId.c_str());
      setIfNotEmpty(item, "vendorId", (*it)->vendorId.c_str());
      setIfNotEmpty(item, "productId", (*it)->productId.c_str());

      Nan::Set(results, i, item);
    }
    argv[0] = Nan::Null();
    argv[1] = results;
  }
  data->callback.Call(2, argv);

  for (std::list<ListResultItem*>::iterator it = data->results.begin(); it != data->results.end(); ++it) {
    delete *it;
  }
  delete data;
  delete req;
}


void EIO_Flush(uv_work_t* req) {
  VoidBaton* data = static_cast<VoidBaton*>(req->data);

  DWORD purge_all = PURGE_RXABORT | PURGE_RXCLEAR | PURGE_TXABORT | PURGE_TXCLEAR;
  if (!PurgeComm((HANDLE)data->fd, purge_all)) {
    ErrorCodeToString("Flushing connection (PurgeComm)", GetLastError(), data->errorString);
    return;
  }
}

void EIO_Drain(uv_work_t* req) {
  VoidBaton* data = static_cast<VoidBaton*>(req->data);

  if (!FlushFileBuffers((HANDLE)data->fd)) {
    ErrorCodeToString("Draining connection (FlushFileBuffers)", GetLastError(), data->errorString);
    return;
  }
}
