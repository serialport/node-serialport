#ifndef PACKAGES_SERIALPORT_SRC_DARWIN_LIST_H_
#define PACKAGES_SERIALPORT_SRC_DARWIN_LIST_H_
#include <sys/param.h>  // For MAXPATHLEN
#include <napi.h>
#include <uv.h>
#include <list>
#include <string>

#define ERROR_STRING_SIZE 1088

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

typedef struct SerialDevice {
    char port[MAXPATHLEN];
    char locationId[MAXPATHLEN];
    char vendorId[MAXPATHLEN];
    char productId[MAXPATHLEN];
    char manufacturer[MAXPATHLEN];
    char serialNumber[MAXPATHLEN];
} stSerialDevice;

typedef struct DeviceListItem {
    struct SerialDevice value;
    struct DeviceListItem *next;
    int* length;
} stDeviceListItem;

#endif  // PACKAGES_SERIALPORT_SRC_DARWIN_LIST_H_
