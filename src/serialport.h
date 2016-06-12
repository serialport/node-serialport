#ifndef _serialport_h_
#define _serialport_h_

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <nan.h>
#include <list>
#include <string>

#define ERROR_STRING_SIZE 1024

NAN_METHOD(List);
void EIO_List(uv_work_t* req);
void EIO_AfterList(uv_work_t* req);

NAN_METHOD(Open);
void EIO_Open(uv_work_t* req);
void EIO_AfterOpen(uv_work_t* req);
void AfterOpenSuccess(int fd, Nan::Callback* dataCallback, Nan::Callback* disconnectedCallback, Nan::Callback* errorCallback);

NAN_METHOD(Update);
void EIO_Update(uv_work_t* req);
void EIO_AfterUpdate(uv_work_t* req);

NAN_METHOD(Write);
void EIO_Write(uv_work_t* req);
void EIO_AfterWrite(uv_work_t* req);

NAN_METHOD(Close);
void EIO_Close(uv_work_t* req);
void EIO_AfterClose(uv_work_t* req);

NAN_METHOD(Flush);
void EIO_Flush(uv_work_t* req);
void EIO_AfterFlush(uv_work_t* req);

NAN_METHOD(Set);
void EIO_Set(uv_work_t* req);
void EIO_AfterSet(uv_work_t* req);

NAN_METHOD(Drain);
void EIO_Drain(uv_work_t* req);
void EIO_AfterDrain(uv_work_t* req);

enum SerialPortParity {
  SERIALPORT_PARITY_NONE = 1,
  SERIALPORT_PARITY_MARK = 2,
  SERIALPORT_PARITY_EVEN = 3,
  SERIALPORT_PARITY_ODD = 4,
  SERIALPORT_PARITY_SPACE = 5
};

enum SerialPortStopBits {
  SERIALPORT_STOPBITS_ONE = 1,
  SERIALPORT_STOPBITS_ONE_FIVE = 2,
  SERIALPORT_STOPBITS_TWO = 3
};

SerialPortParity ToParityEnum(const v8::Local<v8::String>& str);
SerialPortStopBits ToStopBitEnum(double stopBits);

struct OpenBatonPlatformOptions { };
OpenBatonPlatformOptions* ParsePlatformOptions(const v8::Local<v8::Object>& options);

struct OpenBaton {
  char errorString[ERROR_STRING_SIZE];
  Nan::Callback* callback;
  char path[1024];
  int fd;
  int result;
  int baudRate;
  int dataBits;
  int bufferSize;
  bool rtscts;
  bool xon;
  bool xoff;
  bool xany;
  bool dsrdtr;
  bool hupcl;
  bool lock;
  Nan::Callback* dataCallback;
  Nan::Callback* disconnectedCallback;
  Nan::Callback* errorCallback;
  SerialPortParity parity;
  SerialPortStopBits stopBits;
  OpenBatonPlatformOptions* platformOptions;
};

struct ConnectionOptionsBaton {
  char errorString[ERROR_STRING_SIZE];
  Nan::Callback* callback;
  int fd;
  int baudRate;
};

struct WriteBaton {
  int fd;
  char* bufferData;
  size_t bufferLength;
  size_t offset;
  Nan::Persistent<v8::Object> buffer;
  Nan::Callback* callback;
  int result;
  char errorString[ERROR_STRING_SIZE];
};

struct QueuedWrite {
  uv_work_t req;
  QueuedWrite *prev;
  QueuedWrite *next;
  WriteBaton* baton;

  QueuedWrite() {
    prev = this;
    next = this;

    baton = 0;
  }

  ~QueuedWrite() {
    remove();
  }

  void remove() {
    prev->next = next;
    next->prev = prev;

    next = this;
    prev = this;
  }

  void insert_tail(QueuedWrite *qw) {
    qw->next = this;
    qw->prev = this->prev;
    qw->prev->next = qw;
    this->prev = qw;
  }

  bool empty() {
    return next == this;
  }
};

struct CloseBaton {
  int fd;
  Nan::Callback* callback;
  char errorString[ERROR_STRING_SIZE];
};

struct ListResultItem {
  std::string comName;
  std::string manufacturer;
  std::string serialNumber;
  std::string pnpId;
  std::string locationId;
  std::string vendorId;
  std::string productId;
};

struct ListBaton {
  Nan::Callback* callback;
  std::list<ListResultItem*> results;
  char errorString[ERROR_STRING_SIZE];
};

struct FlushBaton {
  int fd;
  Nan::Callback* callback;
  int result;
  char errorString[ERROR_STRING_SIZE];
};

struct SetBaton {
  int fd;
  Nan::Callback* callback;
  int result;
  char errorString[ERROR_STRING_SIZE];
  bool rts;
  bool cts;
  bool dtr;
  bool dsr;
  bool brk;
};

struct DrainBaton {
  int fd;
  Nan::Callback* callback;
  int result;
  char errorString[ERROR_STRING_SIZE];
};

int setup(int fd, OpenBaton *data);
int setBaudRate(ConnectionOptionsBaton *data);
#endif
