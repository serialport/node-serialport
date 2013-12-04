// Copyright (C) 2013 Robert Giseburt <giseburt@gmail.com>
// serialport_poller.h Written as a part of https://github.com/voodootikigod/node-serialport
// License to use this is the same as that of node-serialport.

#ifndef SERIALPORT_POLLER_H
#define SERIALPORT_POLLER_H

#include <nan.h>

class SerialportPoller : public node::ObjectWrap {
 public:
  static void Init(v8::Handle<v8::Object> target);

  void callCallback();

  void _start();
  void _stop();

 private:
  SerialportPoller();
  ~SerialportPoller();

  static NAN_METHOD(New);
  static NAN_METHOD(Close);
  static NAN_METHOD(Start);
  
  uv_poll_t poll_handle_;
  int fd_;

  NanCallback* callback_;
};

#endif