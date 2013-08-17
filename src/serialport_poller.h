// Copyright (C) 2013 Robert Giseburt <giseburt@gmail.com>
// serialport_poller.h Written as a part of https://github.com/voodootikigod/node-serialport
// License to use this is the same as that of node-serialport.

#ifndef SERIALPORT_POLLER_H
#define SERIALPORT_POLLER_H

#include <node.h>

class SerialportPoller : public node::ObjectWrap {
 public:
  static void Init(v8::Handle<v8::Object> target);

  void callCallback();

  void _start();
  void _stop();

 private:
  SerialportPoller();
  ~SerialportPoller();

  static v8::Handle<v8::Value> New(const v8::Arguments& args);
  static v8::Handle<v8::Value> Close(const v8::Arguments& args);
  static v8::Handle<v8::Value> Start(const v8::Arguments& args);
  
  uv_poll_t poll_handle_;
  int fd_;

  v8::Persistent<v8::Function> callback_;
};

#endif