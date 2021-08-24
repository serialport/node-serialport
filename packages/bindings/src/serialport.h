#ifndef PACKAGES_SERIALPORT_SRC_SERIALPORT_H_
#define PACKAGES_SERIALPORT_SRC_SERIALPORT_H_

// Workaround for electron 11 abi issue https://github.com/serialport/node-serialport/issues/2191
#include <node_version.h>
#if CHECK_NODE_API_MODULE_VERSION && NODE_API_MODULE_VERSION == 85
#define V8_REVERSE_JSARGS
#endif

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <napi.h>
#include <string>

#define ERROR_STRING_SIZE 1024

Napi::Value Open(const Napi::CallbackInfo& info);
void EIO_Open(void* req);

Napi::Value Update(const Napi::CallbackInfo& info);
void EIO_Update(napi_env env, void* req);
void EIO_AfterUpdate(napi_env n_env, napi_status status, void* req);

Napi::Value Close(const Napi::CallbackInfo& info);
void EIO_Close(napi_env env, void* req);
void EIO_AfterClose(napi_env n_env, napi_status status, void* req);

Napi::Value Flush(const Napi::CallbackInfo& info);
void EIO_Flush(napi_env env, void* req);
void EIO_AfterFlush(napi_env n_env, napi_status status, void* req);

Napi::Value Set(const Napi::CallbackInfo& info);
void EIO_Set(napi_env env, void* req);
void EIO_AfterSet(napi_env n_env, napi_status status, void* req);

Napi::Value Get(const Napi::CallbackInfo& info);
void EIO_Get(napi_env env, void* req);
void EIO_AfterGet(napi_env n_env, napi_status status, void* req);

Napi::Value GetBaudRate(const Napi::CallbackInfo& info);
void EIO_GetBaudRate(napi_env env, void* req);
void EIO_AfterGetBaudRate(napi_env n_env, napi_status status, void* req);

Napi::Value Drain(const Napi::CallbackInfo& info);
void EIO_Drain(napi_env env, void* req);
void EIO_AfterDrain(napi_env n_env, napi_status status, void* req);

enum SerialPortParity {
  SERIALPORT_PARITY_NONE  = 1,
  SERIALPORT_PARITY_MARK  = 2,
  SERIALPORT_PARITY_EVEN  = 3,
  SERIALPORT_PARITY_ODD   = 4,
  SERIALPORT_PARITY_SPACE = 5
};

enum SerialPortStopBits {
  SERIALPORT_STOPBITS_ONE      = 1,
  SERIALPORT_STOPBITS_ONE_FIVE = 2,
  SERIALPORT_STOPBITS_TWO      = 3
};

SerialPortParity ToParityEnum(const Napi::String& str);
SerialPortStopBits ToStopBitEnum(double stopBits);

struct OpenBaton : public Napi::AsyncWorker {
  OpenBaton(Napi::Function& callback) : Napi::AsyncWorker(callback, "node-serialport:OpenBaton"), 
  errorString(), path() {}
  char errorString[ERROR_STRING_SIZE];
  char path[1024];
  int fd = 0;
  int result = 0;
  int baudRate = 0;
  int dataBits = 0;
  bool rtscts = false;
  bool xon = false;
  bool xoff = false;
  bool xany = false;
  bool dsrdtr = false;
  bool hupcl = false;
  bool lock = false;
  SerialPortParity parity;
  SerialPortStopBits stopBits;
#ifndef WIN32
  uint8_t vmin = 0;
  uint8_t vtime = 0;
#endif
  void Execute() override {
    EIO_Open(this);
  }

  void OnError(Napi::Error const &error) override {
    auto env = Env();
    Napi::HandleScope scope(env);
    Callback().Call({Napi::String::New(env, errorString), env.Undefined()});
  }

  void OnOK() override {
    auto env = Env();
    Napi::HandleScope scope(env);
    Callback().Call({env.Null(), Napi::Number::New(env, result)});
  }
};

struct ConnectionOptions {
  ConnectionOptions() : errorString() {}
  char errorString[ERROR_STRING_SIZE];
  int fd = 0;
  int baudRate = 0;
};
struct ConnectionOptionsBaton : ConnectionOptions {//, Napi::AsyncResource {
  ConnectionOptionsBaton() {} // : AsyncResource("node-serialport:ConnectionOptionsBaton") {}
  Napi::FunctionReference callback;
  napi_async_work work;
};

struct SetBaton {//: public Napi::AsyncResource {
  SetBaton() : // AsyncResource("node-serialport:SetBaton"), 
  errorString() {}
  int fd = 0;
  Napi::FunctionReference callback;
  napi_async_work work;
  int result = 0;
  char errorString[ERROR_STRING_SIZE];
  bool rts = false;
  bool cts = false;
  bool dtr = false;
  bool dsr = false;
  bool brk = false;
  bool lowLatency = false;
};

struct GetBaton {//: public Napi::AsyncResource {
  GetBaton() : // AsyncResource("node-serialport:GetBaton"), 
  errorString() {}
  int fd = 0;
  Napi::FunctionReference callback;
  napi_async_work work;
  char errorString[ERROR_STRING_SIZE];
  bool cts = false;
  bool dsr = false;
  bool dcd = false;
  bool lowLatency = false;
};

struct GetBaudRateBaton {//: public Napi::AsyncResource {
  GetBaudRateBaton() : // AsyncResource("node-serialport:GetBaudRateBaton"), 
  errorString() {}
  int fd = 0;
  Napi::FunctionReference callback;
  napi_async_work work;
  char errorString[ERROR_STRING_SIZE];
  int baudRate = 0;
};

struct VoidBaton {//: public Napi::AsyncResource {
  VoidBaton() : // AsyncResource("node-serialport:VoidBaton"), 
  errorString() {}
  int fd = 0;
  Napi::FunctionReference callback;
  napi_async_work work;
  char errorString[ERROR_STRING_SIZE];
};

int setup(int fd, OpenBaton *data);
int setBaudRate(ConnectionOptions *data);
#endif  // PACKAGES_SERIALPORT_SRC_SERIALPORT_H_
