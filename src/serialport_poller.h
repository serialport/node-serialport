// Copyright (C) 2013 Robert Giseburt <giseburt@gmail.com>
// serialport_poller.h Written as a part of https://github.com/voodootikigod/node-serialport
// License to use this is the same as that of node-serialport.

#ifndef SERIALPORT_POLLER_H
#define SERIALPORT_POLLER_H

#include <nan.h>
#include "serialport.h"

class SerialportPoller : public Nan::ObjectWrap {
 public:
  static void Init(v8::Handle<v8::Object> target);

  void callCallback(int status);

  void _start();
  void _stop();

 private:
  SerialportPoller();
  ~SerialportPoller();

  static void New(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void Close(const Nan::FunctionCallbackInfo<v8::Value>& info);
  static void Start(const Nan::FunctionCallbackInfo<v8::Value>& info);
  
  uv_poll_t poll_handle_;
  int fd_;
  char errorString[ERROR_STRING_SIZE];

  Nan::Callback* callback_;
};

#endif
