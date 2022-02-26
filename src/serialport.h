#ifndef PACKAGES_SERIALPORT_SRC_SERIALPORT_H_
#define PACKAGES_SERIALPORT_SRC_SERIALPORT_H_

// Workaround for electron 11 abi issue https://github.com/serialport/node-serialport/issues/2191
// TODO Replace with ABI stable runtime check (per https://github.com/serialport/node-serialport/pull/2305#discussion_r697542996)
#include <node_version.h>
#if CHECK_NODE_API_MODULE_VERSION && NODE_API_MODULE_VERSION == 85
#define V8_REVERSE_JSARGS
#endif

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <napi.h>
#include <string>

#define ERROR_STRING_SIZE 1088

Napi::Value Open(const Napi::CallbackInfo& info);

Napi::Value Update(const Napi::CallbackInfo& info);

Napi::Value Close(const Napi::CallbackInfo& info);

Napi::Value Flush(const Napi::CallbackInfo& info);

Napi::Value Set(const Napi::CallbackInfo& info);

Napi::Value Get(const Napi::CallbackInfo& info);

Napi::Value GetBaudRate(const Napi::CallbackInfo& info);

Napi::Value Drain(const Napi::CallbackInfo& info);

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

enum SerialPortRtsMode {
  SERIALPORT_RTSMODE_ENABLE     = 1,
  SERIALPORT_RTSMODE_HANDSHAKE  = 2,
  SERIALPORT_RTSMODE_TOGGLE     = 3
};

SerialPortParity ToParityEnum(const Napi::String& str);
SerialPortStopBits ToStopBitEnum(double stopBits);
SerialPortRtsMode ToRtsModeEnum(const Napi::String& str);

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
  bool hupcl = false;
  bool lock = false;
  SerialPortParity parity;
  SerialPortStopBits stopBits;
  SerialPortRtsMode rtsMode;
#ifndef WIN32
  uint8_t vmin = 0;
  uint8_t vtime = 0;
#endif
  void Execute() override;

  void OnOK() override {
    Napi::Env env = Env();
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
struct ConnectionOptionsBaton : ConnectionOptions , Napi::AsyncWorker {
  ConnectionOptionsBaton(Napi::Function& callback) : ConnectionOptions() , Napi::AsyncWorker(callback, "node-serialport:ConnectionOptionsBaton") {}

  void Execute() override;

  void OnOK() override {
    Napi::Env env = Env();
    Napi::HandleScope scope(env);
    Callback().Call({env.Null()});
  }
};

struct SetBaton : public Napi::AsyncWorker {
  SetBaton(Napi::Function& callback) : Napi::AsyncWorker(callback, "node-serialport:SetBaton"),
  errorString() {}
  int fd = 0;
  int result = 0;
  char errorString[ERROR_STRING_SIZE];
  bool rts = false;
  bool cts = false;
  bool dtr = false;
  bool dsr = false;
  bool brk = false;
  bool lowLatency = false;

  void Execute() override;

  void OnOK() override {
    Napi::Env env = Env();
    Napi::HandleScope scope(env);
    Callback().Call({env.Null()});
  }
};

struct GetBaton : public Napi::AsyncWorker {
  GetBaton(Napi::Function& callback) : Napi::AsyncWorker(callback, "node-serialport:GetBaton"),
  errorString() {}
  int fd = 0;
  char errorString[ERROR_STRING_SIZE];
  bool cts = false;
  bool dsr = false;
  bool dcd = false;
  bool lowLatency = false;

  void Execute() override;

  void OnOK() override {
    Napi::Env env = Env();
    Napi::HandleScope scope(env);
    Napi::Object results = Napi::Object::New(env);
    results.Set("cts", cts);
    results.Set("dsr", dsr);
    results.Set("dcd", dcd);
    results.Set("lowLatency", lowLatency);
    Callback().Call({env.Null(), results});
  }
};

struct GetBaudRateBaton : public Napi::AsyncWorker {
  GetBaudRateBaton(Napi::Function& callback) : Napi::AsyncWorker(callback, "node-serialport:GetBaudRateBaton"),
  errorString() {}
  int fd = 0;
  char errorString[ERROR_STRING_SIZE];
  int baudRate = 0;

  void Execute() override;

  void OnOK() override {
    Napi::Env env = Env();
    Napi::HandleScope scope(env);
    Napi::Object results = Napi::Object::New(env);
    (results).Set(Napi::String::New(env, "baudRate"), Napi::Number::New(env, baudRate));
    Callback().Call({env.Null(),results});
  }
};

struct VoidBaton : public Napi::AsyncWorker {
  VoidBaton(Napi::Function& callback, const char *resource_name) : Napi::AsyncWorker(callback, resource_name),
  errorString() {}
  int fd = 0;
  char errorString[ERROR_STRING_SIZE];

  void OnOK() override {
    Napi::Env env = Env();
    Napi::HandleScope scope(env);
    Callback().Call({env.Null()});
  }
};

struct CloseBaton : VoidBaton {
  CloseBaton(Napi::Function& callback) : VoidBaton(callback, "node-serialport:CloseBaton") {}
  void Execute() override;
};

struct DrainBaton : VoidBaton {
  DrainBaton(Napi::Function& callback) : VoidBaton(callback, "node-serialport:DrainBaton") {}
  void Execute() override;
};

struct FlushBaton : VoidBaton {
  FlushBaton(Napi::Function& callback) : VoidBaton(callback, "node-serialport:FlushBaton") {}
  void Execute() override;
};

int setup(int fd, OpenBaton *data);
int setBaudRate(ConnectionOptions *data);
#endif  // PACKAGES_SERIALPORT_SRC_SERIALPORT_H_
