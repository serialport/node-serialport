#ifndef PACKAGES_SERIALPORT_SRC_SERIALPORT_H_
#define PACKAGES_SERIALPORT_SRC_SERIALPORT_H_
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

NAN_METHOD(Get);
void EIO_Get(uv_work_t* req);
void EIO_AfterGet(uv_work_t* req);

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

struct OpenBaton {
  char errorString[ERROR_STRING_SIZE];
  Nan::Callback callback;
  char path[1024];
  int fd;
  int baudRate;
  int dataBits;
  bool rtscts;
  bool xon;
  bool xoff;
  bool xany;
  bool dsrdtr;
  bool hupcl;
  bool lock;
  SerialPortParity parity;
  SerialPortStopBits stopBits;
#ifndef WIN32
  uint8_t vmin;
  uint8_t vtime;
#endif
};


struct UpdateBaton {
  int fd;
  Nan::Callback callback;
  char errorString[ERROR_STRING_SIZE];
  int baudRate;
  bool rts;
  bool dtr;
  bool dsr;
  bool brk;
};

struct StatusBaton {
  int fd;
  Nan::Callback callback;
  char errorString[ERROR_STRING_SIZE];
  int baudRate;
  bool cts;
  bool dsr;
  bool dcd;
};

struct VoidBaton {
  int fd;
  Nan::Callback callback;
  char errorString[ERROR_STRING_SIZE];
};

int setup(int fd, OpenBaton *data);
int setBaudRate(ConnectionOptionsBaton *data);
#endif  // PACKAGES_SERIALPORT_SRC_SERIALPORT_H_
