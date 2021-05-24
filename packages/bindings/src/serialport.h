#ifndef PACKAGES_SERIALPORT_SRC_SERIALPORT_H_
#define PACKAGES_SERIALPORT_SRC_SERIALPORT_H_

// Workaround for electron 11 abi issue https://github.com/serialport/node-serialport/issues/2191
#include <node_version.h>
#if CHECK_NODE_MODULE_VERSION && NODE_MODULE_VERSION == 85
#define V8_REVERSE_JSARGS
#endif

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <nan.h>
#include <string>

#define ERROR_STRING_SIZE 1024

NAN_METHOD(Open);
void EIO_Open(uv_work_t* req);
void EIO_AfterOpen(uv_work_t* req);

NAN_METHOD(Update);
void EIO_Update(uv_work_t* req);
void EIO_AfterUpdate(uv_work_t* req);

NAN_METHOD(Close);
void EIO_Close(uv_work_t* req);
void EIO_AfterClose(uv_work_t* req);

NAN_METHOD(Flush);
void EIO_Flush(uv_work_t* req);
void EIO_AfterFlush(uv_work_t* req);

NAN_METHOD(Set);
void EIO_Set(uv_work_t* req);
void EIO_AfterSet(uv_work_t* req);

NAN_METHOD(Get);
void EIO_Get(uv_work_t* req);
void EIO_AfterGet(uv_work_t* req);

NAN_METHOD(GetBaudRate);
void EIO_GetBaudRate(uv_work_t* req);
void EIO_AfterGetBaudRate(uv_work_t* req);

NAN_METHOD(Drain);
void EIO_Drain(uv_work_t* req);
void EIO_AfterDrain(uv_work_t* req);

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

SerialPortParity ToParityEnum(const v8::Local<v8::String>& str);
SerialPortStopBits ToStopBitEnum(double stopBits);

struct OpenBaton : public Nan::AsyncResource {
  OpenBaton() :
    AsyncResource("node-serialport:OpenBaton"), errorString(), path() {}
  char errorString[ERROR_STRING_SIZE];
  Nan::Callback callback;
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
};

struct ConnectionOptions {
  ConnectionOptions() : errorString() {}
  char errorString[ERROR_STRING_SIZE];
  int fd = 0;
  int baudRate = 0;
};
struct ConnectionOptionsBaton : ConnectionOptions, Nan::AsyncResource {
  ConnectionOptionsBaton() :
    AsyncResource("node-serialport:ConnectionOptionsBaton") {}
  Nan::Callback callback;
};

struct SetBaton : public Nan::AsyncResource {
  SetBaton() : AsyncResource("node-serialport:SetBaton"), errorString() {}
  int fd = 0;
  Nan::Callback callback;
  int result = 0;
  char errorString[ERROR_STRING_SIZE];
  bool rts = false;
  bool cts = false;
  bool dtr = false;
  bool dsr = false;
  bool brk = false;
  bool lowLatency = false;
};

struct GetBaton : public Nan::AsyncResource {
  GetBaton() : AsyncResource("node-serialport:GetBaton"), errorString() {}
  int fd = 0;
  Nan::Callback callback;
  char errorString[ERROR_STRING_SIZE];
  bool cts = false;
  bool dsr = false;
  bool dcd = false;
  bool lowLatency = false;
};

struct GetBaudRateBaton : public Nan::AsyncResource {
  GetBaudRateBaton() :
    AsyncResource("node-serialport:GetBaudRateBaton"), errorString() {}
  int fd = 0;
  Nan::Callback callback;
  char errorString[ERROR_STRING_SIZE];
  int baudRate = 0;
};

struct VoidBaton : public Nan::AsyncResource {
  VoidBaton() : AsyncResource("node-serialport:VoidBaton"), errorString() {}
  int fd = 0;
  Nan::Callback callback;
  char errorString[ERROR_STRING_SIZE];
};

int setup(int fd, OpenBaton *data);
int setBaudRate(ConnectionOptions *data);
#endif  // PACKAGES_SERIALPORT_SRC_SERIALPORT_H_
