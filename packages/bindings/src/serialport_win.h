#ifndef PACKAGES_SERIALPORT_SRC_SERIALPORT_WIN_H_
#define PACKAGES_SERIALPORT_SRC_SERIALPORT_WIN_H_
// #include <stdio.h>
// #include <stdlib.h>
// #include <string.h>
#include <napi.h>
#include <uv.h>
#include <node_buffer.h>
#include <list>
#include <string>

#define ERROR_STRING_SIZE 1088

static inline HANDLE int2handle(int ptr) {
  return reinterpret_cast<HANDLE>(static_cast<uintptr_t>(ptr));
}

void ErrorCodeToString(const char* prefix, int errorCode, char *errorStr);
void __stdcall WriteIOCompletion(DWORD errorCode, DWORD bytesTransferred, OVERLAPPED* ov);

struct WriteBaton : public Napi::AsyncWorker {
   WriteBaton(Napi::Function& callback) : Napi::AsyncWorker(callback, "node-serialport:WriteBaton"), 
   bufferData(), errorString() {}
  int fd = 0;
  char* bufferData = nullptr;
  size_t bufferLength = 0;
  size_t offset = 0;
  size_t bytesWritten = 0;
  void* hThread = nullptr;
  bool complete = false;
  Napi::ObjectReference buffer;
  int result = 0;
  char errorString[ERROR_STRING_SIZE];

  void Execute() override {
    OVERLAPPED* ov = new OVERLAPPED;
    memset(ov, 0, sizeof(OVERLAPPED));
    ov->hEvent = static_cast<void*>(this);

    while (!complete) {
      char* offsetPtr = bufferData + offset;
      // WriteFileEx requires calling GetLastError even upon success. Clear the error beforehand.
      SetLastError(0);
      WriteFileEx(int2handle(fd), offsetPtr, static_cast<DWORD>(bufferLength - offset), ov, WriteIOCompletion);
      // Error codes when call is successful, such as ERROR_MORE_DATA.
      DWORD lastError = GetLastError();
      if (lastError != ERROR_SUCCESS) {
        ErrorCodeToString("Writing to COM port (WriteFileEx)", lastError, errorString);
        this->SetError(errorString);
        break;
      }
      // IOCompletion routine is only called once this thread is in an alertable wait state.
      SleepEx(INFINITE, TRUE);
    }
  }

  // void OnError(Napi::Error const &error) override {
  //   Napi::Env env = Env();
  //   Napi::HandleScope scope(env);
  //   Callback().Call({Napi::String::New(env, errorString)});
  // }

  void OnOK() override {
    Napi::Env env = Env();
    Napi::HandleScope scope(env);
    Callback().Call({env.Null()});
  }
};

Napi::Value Write(const Napi::CallbackInfo& info);

void __stdcall ReadIOCompletion(DWORD errorCode, DWORD bytesTransferred, OVERLAPPED* ov);

struct ReadBaton : public Napi::AsyncWorker {
  ReadBaton(Napi::Function& callback) : Napi::AsyncWorker(callback, "node-serialport:ReadBaton"), 
  errorString() {}
  int fd = 0;
  char* bufferData = nullptr;
  size_t bufferLength = 0;
  size_t bytesRead = 0;
  size_t bytesToRead = 0;
  size_t offset = 0;
  void* hThread = nullptr;
  bool complete = false;
  char errorString[ERROR_STRING_SIZE];

  void Execute() override {
    DWORD lastError;

    OVERLAPPED* ov = new OVERLAPPED;
    memset(ov, 0, sizeof(OVERLAPPED));
    ov->hEvent = static_cast<void*>(this);

    while (!complete) {
      // Reset the read timeout to 0, so that it will block until more data arrives.
      COMMTIMEOUTS commTimeouts = {};
      commTimeouts.ReadIntervalTimeout = 0;
      if (!SetCommTimeouts(int2handle(fd), &commTimeouts)) {
        lastError = GetLastError();
        ErrorCodeToString("Setting COM timeout (SetCommTimeouts)", lastError, errorString);
        this->SetError(errorString);
        break;
      }
      // ReadFileEx doesn't use overlapped's hEvent, so it is reserved for user data.
      ov->hEvent = static_cast<HANDLE>(this);
      char* offsetPtr = bufferData + offset;
      // ReadFileEx requires calling GetLastError even upon success. Clear the error beforehand.
      SetLastError(0);
      // Only read 1 byte, so that the callback will be triggered once any data arrives.
      ReadFileEx(int2handle(fd), offsetPtr, 1, ov, ReadIOCompletion);
      // Error codes when call is successful, such as ERROR_MORE_DATA.
      lastError = GetLastError();
      if (lastError != ERROR_SUCCESS) {
        ErrorCodeToString("Reading from COM port (ReadFileEx)", lastError, errorString);
        this->SetError(errorString);
        break;
      }
      // IOCompletion routine is only called once this thread is in an alertable wait state.
      SleepEx(INFINITE, TRUE);
    }
  }

  // void OnError(Napi::Error const &error) override {
  //   Napi::Env env = Env();
  //   Napi::HandleScope scope(env);
  //   Callback().Call({Napi::String::New(env, errorString), env.Undefined()});
  // }

  void OnOK() override {
    Napi::Env env = Env();
    Napi::HandleScope scope(env);
    Callback().Call({env.Null(), Napi::Number::New(env, static_cast<int>(bytesRead))});
  }
};

Napi::Value Read(const Napi::CallbackInfo& info);
void EIO_Read(uv_work_t* req);
void EIO_AfterRead(uv_async_t* req);
DWORD __stdcall ReadThread(LPVOID param);


Napi::Value List(const Napi::CallbackInfo& info);
void setIfNotEmpty(Napi::Object item, std::string key, const char *value);

struct ListResultItem {
  std::string path;
  std::string manufacturer;
  std::string serialNumber;
  std::string pnpId;
  std::string locationId;
  std::string vendorId;
  std::string productId;
};

struct ListBaton : public Napi::AsyncWorker {
  ListBaton(Napi::Function& callback) : Napi::AsyncWorker(callback, "node-serialport:ListBaton"), 
  errorString() {}
  std::list<ListResultItem*> results;
  char errorString[ERROR_STRING_SIZE];
  void Execute() override;

  // void OnError(Napi::Error const &error) override {
  //   Napi::Env env = Env();
  //   Napi::HandleScope scope(env);
  //   Callback().Call({Napi::String::New(env, errorString), env.Undefined()});
  // }

  void OnOK() override {
    Napi::Env env = Env();
    Napi::HandleScope scope(env);
    Napi::Array result = Napi::Array::New(env);
    int i = 0;
    for (std::list<ListResultItem*>::iterator it = results.begin(); it != results.end(); ++it, i++) {
      Napi::Object item = Napi::Object::New(env);

      setIfNotEmpty(item, "path", (*it)->path.c_str());
      setIfNotEmpty(item, "manufacturer", (*it)->manufacturer.c_str());
      setIfNotEmpty(item, "serialNumber", (*it)->serialNumber.c_str());
      setIfNotEmpty(item, "pnpId", (*it)->pnpId.c_str());
      setIfNotEmpty(item, "locationId", (*it)->locationId.c_str());
      setIfNotEmpty(item, "vendorId", (*it)->vendorId.c_str());
      setIfNotEmpty(item, "productId", (*it)->productId.c_str());

      (result).Set(i, item);
    }
    Callback().Call({env.Null(), result});
  }
};

#endif  // PACKAGES_SERIALPORT_SRC_SERIALPORT_WIN_H_
