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
  case ERROR_INVALID_PARAMETER:
    _snprintf_s(errorStr, ERROR_STRING_SIZE, _TRUNCATE, "%s: The parameter is incorrect", prefix);
    break;      
  default:
    _snprintf_s(errorStr, ERROR_STRING_SIZE, _TRUNCATE, "%s: Unknown error code %d", prefix, errorCode);
    break;
  }
}

void AsyncCloseCallback(uv_handle_t* handle)
{
  uv_async_t* async = (uv_async_t*)handle;
  delete async;
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


  dcb.fOutxDsrFlow = FALSE;
  dcb.fOutxCtsFlow = FALSE;

  if (data->xon) {
    dcb.fOutX = TRUE;
  } else {
    dcb.fOutX = FALSE;
  }

  if (data->xoff) {
    dcb.fInX = TRUE;
  } else {
    dcb.fInX = FALSE;
  }

  if (data->rtscts) {
    dcb.fRtsControl = RTS_CONTROL_ENABLE;
  } else {
    dcb.fRtsControl = RTS_CONTROL_DISABLE;
  }

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

  // Set the timeouts for read and write operations.
  // Read operation will wait for at least 1 byte to be received.
  COMMTIMEOUTS commTimeouts = {};
  commTimeouts.ReadIntervalTimeout = 0;         // Never timeout, always wait for data.
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

void EIO_GetBaudRate(uv_work_t* req) {
  GetBaudRateBaton* data = static_cast<GetBaudRateBaton*>(req->data);

  DCB dcb = { 0 };
  SecureZeroMemory(&dcb, sizeof(DCB));
  dcb.DCBlength = sizeof(DCB);

  if (!GetCommState((HANDLE)data->fd, &dcb)) {
    ErrorCodeToString("Getting baud rate (GetCommState)", GetLastError(), data->errorString);
    return;
  }

  data->baudRate = (int)dcb.BaudRate;
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
  baton->fd = fd;
  baton->buffer.Reset(buffer);
  baton->bufferData = bufferData;
  baton->bufferLength = bufferLength;
  baton->offset = 0;
  baton->callback.Reset(info[2].As<v8::Function>());
  baton->complete = false;

  uv_async_t* async = new uv_async_t;
  uv_async_init(uv_default_loop(), async, EIO_AfterWrite);
  async->data = baton;
  // WriteFileEx requires a thread that can block. Create a new thread to
  // run the write operation, saving the handle so it can be deallocated later.
  baton->hThread = CreateThread(NULL, 0, WriteThread, async, 0, NULL);
}

void __stdcall WriteIOCompletion(DWORD errorCode, DWORD bytesTransferred, OVERLAPPED* ov) {
  WriteBaton* baton = static_cast<WriteBaton*>(ov->hEvent);
  DWORD bytesWritten;
  if (!GetOverlappedResult((HANDLE)baton->fd, ov, &bytesWritten, TRUE)) {
    errorCode = GetLastError();
    ErrorCodeToString("Writing to COM port (GetOverlappedResult)", errorCode, baton->errorString);
    baton->complete = true;
    return;
  }
  if (bytesWritten) {
    baton->offset += bytesWritten;
    if (baton->offset >= baton->bufferLength) {
      baton->complete = true;
    }
  }
}

DWORD __stdcall WriteThread(LPVOID param) {
  uv_async_t* async = static_cast<uv_async_t*>(param);
  WriteBaton* baton = static_cast<WriteBaton*>(async->data);

  OVERLAPPED* ov = new OVERLAPPED;
  memset(ov, 0, sizeof(OVERLAPPED));
  ov->hEvent = static_cast<void*>(baton);

  while (!baton->complete) {
    char* offsetPtr = baton->bufferData + baton->offset;
    // WriteFileEx requires calling GetLastError even upon success. Clear the error beforehand.
    SetLastError(0);
    WriteFileEx((HANDLE)baton->fd, offsetPtr, static_cast<DWORD>(baton->bufferLength - baton->offset), ov, WriteIOCompletion);
    // Error codes when call is successful, such as ERROR_MORE_DATA.
    DWORD lastError = GetLastError();
    if (lastError != ERROR_SUCCESS) {
      ErrorCodeToString("Writing to COM port (WriteFileEx)", lastError, baton->errorString);
      break;
    }
    // IOCompletion routine is only called once this thread is in an alertable wait state.
    SleepEx(INFINITE, TRUE);
  }
  delete ov;
  // Signal the main thread to run the callback.
  uv_async_send(async);
  ExitThread(0);
}

void EIO_AfterWrite(uv_async_t* req) {
  Nan::HandleScope scope;
  WriteBaton* baton = static_cast<WriteBaton*>(req->data);
  WaitForSingleObject(baton->hThread, INFINITE);
  CloseHandle(baton->hThread);
  uv_close((uv_handle_t*)req, AsyncCloseCallback);

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
  baton->fd = fd;
  baton->offset = offset;
  baton->bytesToRead = bytesToRead;
  baton->bufferLength = bufferLength;
  baton->bufferData = node::Buffer::Data(buffer);
  baton->callback.Reset(info[4].As<v8::Function>());
  baton->complete = false;

  uv_async_t* async = new uv_async_t;
  uv_async_init(uv_default_loop(), async, EIO_AfterRead);
  async->data = baton;
  // ReadFileEx requires a thread that can block. Create a new thread to
  // run the read operation, saving the handle so it can be deallocated later.
  baton->hThread = CreateThread(NULL, 0, ReadThread, async, 0, NULL);
}

void __stdcall ReadIOCompletion(DWORD errorCode, DWORD bytesTransferred, OVERLAPPED* ov) {
  ReadBaton* baton = static_cast<ReadBaton*>(ov->hEvent);

  if (errorCode) {
    ErrorCodeToString("Reading from COM port (ReadIOCompletion)", errorCode, baton->errorString);
    baton->complete = true;
    return;
  }

  DWORD lastError;
  if (!GetOverlappedResult((HANDLE)baton->fd, ov, &bytesTransferred, TRUE)) {
    lastError = GetLastError();
    ErrorCodeToString("Reading from COM port (GetOverlappedResult)", lastError, baton->errorString);
    baton->complete = true;
    return;
  }
  if (bytesTransferred) {
    baton->bytesToRead -= bytesTransferred;
    baton->bytesRead += bytesTransferred;
    baton->offset += bytesTransferred;
  }

  // ReadFileEx and GetOverlappedResult retrieved only 1 byte. Read any additional data in the input
  // buffer. Set the timeout to MAXDWORD in order to disable timeouts, so the read operation will
  // return immediately no matter how much data is available.
  COMMTIMEOUTS commTimeouts = {};
  commTimeouts.ReadIntervalTimeout = MAXDWORD;
  if (!SetCommTimeouts((HANDLE)baton->fd, &commTimeouts)) {
    lastError = GetLastError();
    ErrorCodeToString("Setting COM timeout (SetCommTimeouts)", lastError, baton->errorString);
    baton->complete = true;
    return;
  }

  // Store additional data after whatever data has already been read.
  char* offsetPtr = baton->bufferData + baton->offset;

  // ReadFile, unlike ReadFileEx, needs an event in the overlapped structure.
  memset(ov, 0, sizeof(OVERLAPPED));
  ov->hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);
  if (!ReadFile((HANDLE)baton->fd, offsetPtr, baton->bytesToRead, &bytesTransferred, ov)) {
    errorCode = GetLastError();

    if (errorCode != ERROR_IO_PENDING) {
      ErrorCodeToString("Reading from COM port (ReadFile)", errorCode, baton->errorString);
      baton->complete = true;
      CloseHandle(ov->hEvent);
      return;
    }

    if (!GetOverlappedResult((HANDLE)baton->fd, ov, &bytesTransferred, TRUE)) {
      lastError = GetLastError();
      ErrorCodeToString("Reading from COM port (GetOverlappedResult)", lastError, baton->errorString);
      baton->complete = true;
      CloseHandle(ov->hEvent);
      return;
    }
  }
  CloseHandle(ov->hEvent);

  baton->bytesToRead -= bytesTransferred;
  baton->bytesRead += bytesTransferred;
  baton->complete = true;
}

DWORD __stdcall ReadThread(LPVOID param) {
  uv_async_t* async = static_cast<uv_async_t*>(param);
  ReadBaton* baton = static_cast<ReadBaton*>(async->data);
  DWORD lastError;

  OVERLAPPED* ov = new OVERLAPPED;
  memset(ov, 0, sizeof(OVERLAPPED));
  ov->hEvent = static_cast<void*>(baton);

  while (!baton->complete) {
    // Reset the read timeout to 0, so that it will block until more data arrives.
    COMMTIMEOUTS commTimeouts = {};
    commTimeouts.ReadIntervalTimeout = 0;
    if (!SetCommTimeouts((HANDLE)baton->fd, &commTimeouts)) {
      lastError = GetLastError();
      ErrorCodeToString("Setting COM timeout (SetCommTimeouts)", lastError, baton->errorString);
      break;
    }
    // ReadFileEx doesn't use overlapped's hEvent, so it is reserved for user data.
    ov->hEvent = static_cast<HANDLE>(baton);
    char* offsetPtr = baton->bufferData + baton->offset;
    // ReadFileEx requires calling GetLastError even upon success. Clear the error beforehand.
    SetLastError(0);
    // Only read 1 byte, so that the callback will be triggered once any data arrives.
    ReadFileEx((HANDLE)baton->fd, offsetPtr, 1, ov, ReadIOCompletion);
    // Error codes when call is successful, such as ERROR_MORE_DATA.
    lastError = GetLastError();
    if (lastError != ERROR_SUCCESS) {
      ErrorCodeToString("Reading from COM port (ReadFileEx)", lastError, baton->errorString);
      break;
    }
    // IOCompletion routine is only called once this thread is in an alertable wait state.
    SleepEx(INFINITE, TRUE);
  }
  delete ov;
  // Signal the main thread to run the callback.
  uv_async_send(async);
  ExitThread(0);
}

void EIO_AfterRead(uv_async_t* req) {
  Nan::HandleScope scope;
  ReadBaton* baton = static_cast<ReadBaton*>(req->data);
  WaitForSingleObject(baton->hThread, INFINITE);
  CloseHandle(baton->hThread);
  uv_close((uv_handle_t*)req, AsyncCloseCallback);

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
