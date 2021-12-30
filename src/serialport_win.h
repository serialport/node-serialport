#ifndef PACKAGES_SERIALPORT_SRC_SERIALPORT_WIN_H_
#define PACKAGES_SERIALPORT_SRC_SERIALPORT_WIN_H_
#include <napi.h>
#include <uv.h>
#include <node_buffer.h>
#include <list>
#include <string>

#define ERROR_STRING_SIZE 1088

static inline HANDLE int2handle(int ptr) {
  return reinterpret_cast<HANDLE>(static_cast<uintptr_t>(ptr));
}

struct WriteBaton {
   WriteBaton() :  bufferData(), errorString() {}
  int fd = 0;
  char* bufferData = nullptr;
  size_t bufferLength = 0;
  size_t offset = 0;
  size_t bytesWritten = 0;
  void* hThread = nullptr;
  bool complete = false;
  Napi::ObjectReference buffer;
	Napi::FunctionReference callback;
  int result = 0;
  char errorString[ERROR_STRING_SIZE];
};

Napi::Value Write(const Napi::CallbackInfo& info);

struct ReadBaton {
  ReadBaton() :  errorString() {}
  int fd = 0;
  char* bufferData = nullptr;
  size_t bufferLength = 0;
  size_t bytesRead = 0;
  size_t bytesToRead = 0;
  size_t offset = 0;
  void* hThread = nullptr;
	Napi::FunctionReference callback;
  bool complete = false;
  char errorString[ERROR_STRING_SIZE];
};

Napi::Value Read(const Napi::CallbackInfo& info);

Napi::Value List(const Napi::CallbackInfo& info);
void setIfNotEmpty(Napi::Object item, std::string key, const char *value);

struct ListResultItem {
  std::string path;
  std::string manufacturer;
  std::string serialNumber;
  std::string pnpId;
  std::string locationId;
  std::string friendlyName;
  std::string vendorId;
  std::string productId;
};

struct ListBaton : public Napi::AsyncWorker {
  ListBaton(Napi::Function& callback) : Napi::AsyncWorker(callback, "node-serialport:ListBaton"), 
  errorString() {}
  std::list<ListResultItem*> results;
  char errorString[ERROR_STRING_SIZE];
  void Execute() override;

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
      setIfNotEmpty(item, "friendlyName", (*it)->friendlyName.c_str());
      setIfNotEmpty(item, "vendorId", (*it)->vendorId.c_str());
      setIfNotEmpty(item, "productId", (*it)->productId.c_str());

      (result).Set(i, item);
    }
    Callback().Call({env.Null(), result});
  }
};

#endif  // PACKAGES_SERIALPORT_SRC_SERIALPORT_WIN_H_
