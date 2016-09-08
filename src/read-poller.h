// Copyright (C) 2013 Robert Giseburt <giseburt@gmail.com>
// serialport_poller.h Written as a part of https://github.com/voodootikigod/node-serialport
// License to use this is the same as that of node-serialport.

#ifndef SRC_READ_POLLER_H_
#define SRC_READ_POLLER_H_

#include <nan.h>
#include "./serialport.h"

class ReadPoller : public Nan::ObjectWrap {
 public:
  static void Init(v8::Handle<v8::Object> target);

  void callCallback(int status);

  void _start();
  void _close();

 private:
  ReadPoller();
  ~ReadPoller();

  static NAN_METHOD(New);
  static NAN_METHOD(Close);

  uv_poll_t poll_handle_;
  int fd_;
  char errorString[ERROR_STRING_SIZE];

  Nan::Callback* callback_;
};

#endif  // SRC_READ_POLLER_H_
