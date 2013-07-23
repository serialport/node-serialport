
#ifndef _serialport_h_
#define _serialport_h_

#include <node.h>
#include <v8.h>
#include <node_buffer.h>
#include <list>
#include <string>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "nan.h"

#if (NODE_MODULE_VERSION > 0x000B)
#include "ngx-queue.h"
#endif

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

NAN_METHOD(List);
void EIO_List(uv_work_t* req);
void EIO_AfterList(uv_work_t* req);

NAN_METHOD(Open);
void EIO_Open(uv_work_t* req);
void EIO_AfterOpen(uv_work_t* req);
void AfterOpenSuccess(int fd, NanCallback *dataCallback, NanCallback *disconnectedCallback, NanCallback *errorCallback);

NAN_METHOD(Write);
void EIO_Write(uv_work_t* req);
void EIO_AfterWrite(uv_work_t* req);

NAN_METHOD(Close);
void EIO_Close(uv_work_t* req);
void EIO_AfterClose(uv_work_t* req);

NAN_METHOD(Flush);
void EIO_Flush(uv_work_t* req);
void EIO_AfterFlush(uv_work_t* req);

SerialPortParity ToParityEnum(const v8::Handle<v8::String>& str);
SerialPortStopBits ToStopBitEnum(double stopBits);

struct OpenBaton {
public:
  char path[1024];
  NanCallback *callback;
  NanCallback *dataCallback;
  NanCallback *disconnectedCallback;
  NanCallback *errorCallback;
  int result;
  int baudRate;
  int dataBits;
  int bufferSize;
  bool flowControl;
  SerialPortParity parity;
  SerialPortStopBits stopBits;
  char errorString[1024];
};

struct WriteBaton {
public:
  int fd;
  char* bufferData;
  size_t bufferLength;
  v8::Local<v8::Object> buffer;
  NanCallback *callback;
  int result;
  char errorString[1024];
};

struct QueuedWrite {
public:
  uv_work_t req;
  ngx_queue_t queue;
  WriteBaton* baton;
};

struct CloseBaton {
public:
  int fd;
  NanCallback *callback;
  char errorString[1024];
};

struct ListResultItem {
public:
  std::string comName;
  std::string manufacturer;
  std::string serialNumber;
  std::string pnpId;
  std::string locationId;
  std::string vendorId;
  std::string productId;
};

struct ListBaton {
public:
  NanCallback *callback;
  std::list<ListResultItem*> results;
  char errorString[1024];
};

struct FlushBaton {
public:
  int fd;
  NanCallback *callback;
  int result;
  char errorString[1024];
};

#endif
