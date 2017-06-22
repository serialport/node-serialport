#ifndef SRC_SERIALPORT_WIN_H_
#define SRC_SERIALPORT_WIN_H_
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <nan.h>
#include <list>
#include <string>

#define ERROR_STRING_SIZE 1024

struct WriteBaton {
  int fd;
  char* bufferData;
  size_t bufferLength;
  size_t offset;
  size_t bytesWritten;
  Nan::Persistent<v8::Object> buffer;
  Nan::Callback callback;
  int result;
  char errorString[ERROR_STRING_SIZE];
};

NAN_METHOD(Write);
void EIO_Write(uv_work_t* req);
void EIO_AfterWrite(uv_work_t* req);

struct ReadBaton {
  int fd;
  char* bufferData;
  size_t bufferLength;
  size_t bytesRead;
  size_t bytesToRead;
  size_t offset;
  char errorString[ERROR_STRING_SIZE];
  Nan::Callback callback;
};

NAN_METHOD(Read);
void EIO_Read(uv_work_t* req);
void EIO_AfterRead(uv_work_t* req);
#endif  // SRC_SERIALPORT_WIN_H_
