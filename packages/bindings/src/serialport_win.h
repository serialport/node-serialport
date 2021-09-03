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

#define ERROR_STRING_SIZE 1024

struct WriteBaton {//}: public Napi::AsyncWorker {
   WriteBaton() : //Napi::AsyncWorker(callback, "node-serialport:WriteBaton"), 
   bufferData(), errorString() {}
  int fd = 0;
  char* bufferData = nullptr;
  size_t bufferLength = 0;
  size_t offset = 0;
  size_t bytesWritten = 0;
  void* hThread = nullptr;
  Napi::Env env = nullptr;
  bool complete = false;
  Napi::ObjectReference buffer;
  Napi::FunctionReference callback;
  int result = 0;
  char errorString[ERROR_STRING_SIZE];
};

Napi::Value Write(const Napi::CallbackInfo& info);
void EIO_Write(uv_work_t* req);
void EIO_AfterWrite(uv_async_t* req);
DWORD __stdcall WriteThread(LPVOID param);


struct ReadBaton {//}: public Napi::AsyncWorker {
  ReadBaton() : //Napi::AsyncWorker(callback, "node-serialport:ReadBaton"), 
  errorString() {}
  int fd = 0;
  char* bufferData = nullptr;
  size_t bufferLength = 0;
  size_t bytesRead = 0;
  size_t bytesToRead = 0;
  size_t offset = 0;
  void* hThread = nullptr;
  Napi::Env env = nullptr;
  bool complete = false;
  char errorString[ERROR_STRING_SIZE];
  Napi::FunctionReference callback;
};

Napi::Value Read(const Napi::CallbackInfo& info);
void EIO_Read(uv_work_t* req);
void EIO_AfterRead(uv_async_t* req);
DWORD __stdcall ReadThread(LPVOID param);


Napi::Value List(const Napi::CallbackInfo& info);
void EIO_List(napi_env env, void* req);
void EIO_AfterList(napi_env n_env, napi_status status, void* req);

struct ListResultItem {
  std::string path;
  std::string manufacturer;
  std::string serialNumber;
  std::string pnpId;
  std::string locationId;
  std::string vendorId;
  std::string productId;
};

struct ListBaton { //}: public Napi::AsyncWorker {
  ListBaton() //: Napi::AsyncWorker(callback, "node-serialport:ListBaton") 
  {}
  Napi::FunctionReference callback;
  napi_async_work work;
  std::list<ListResultItem*> results;
  char errorString[ERROR_STRING_SIZE] = "";
};

#endif  // PACKAGES_SERIALPORT_SRC_SERIALPORT_WIN_H_
