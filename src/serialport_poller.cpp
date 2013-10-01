// Copyright (C) 2013 Robert Giseburt <giseburt@gmail.com>
// serialport_poller.cpp Written as a part of https://github.com/voodootikigod/node-serialport
// License to use this is the same as that of node-serialport.

#include <node.h>
#include "serialport_poller.h"

using namespace v8;

SerialportPoller::SerialportPoller() :  ObjectWrap() {};
SerialportPoller::~SerialportPoller() {
  // printf("~SerialportPoller\n");
  callback_.Dispose();
};

void _serialportReadable(uv_poll_t *req, int status, int events) {
  SerialportPoller* obj = (SerialportPoller*) req->data;

  // We can stop polling until we have read all of the data...
  obj->_stop();

  obj->callCallback();
}

void SerialportPoller::callCallback() {
  // uv_work_t* req = new uv_work_t;

  // Call the callback to go read more data...
  v8::Function::Cast(*callback_)->Call(v8::Context::GetCurrent()->Global(), 0, NULL);//2, argv
}

void SerialportPoller::Init(Handle<Object> target) {
  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
  tpl->SetClassName(String::NewSymbol("SerialportPoller"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);


  // Prototype

  // SerialportPoller.close()
  tpl->PrototypeTemplate()->Set(String::NewSymbol("close"),
      FunctionTemplate::New(Close)->GetFunction());

  // SerialportPoller.start()
  tpl->PrototypeTemplate()->Set(String::NewSymbol("start"),
      FunctionTemplate::New(Start)->GetFunction());

  Persistent<Function> constructor = Persistent<Function>::New(tpl->GetFunction());
  target->Set(String::NewSymbol("SerialportPoller"), constructor);
}

Handle<Value> SerialportPoller::New(const Arguments& args) {
  HandleScope scope;

  SerialportPoller* obj = new SerialportPoller();

  if(!args[0]->IsInt32()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("First argument must be an fd"))));
  }
  obj->fd_ = args[0]->ToInt32()->Int32Value();

  if(!args[1]->IsFunction()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("Third argument must be a function"))));
  }
  obj->callback_ = v8::Persistent<v8::Function>::New(v8::Local<v8::Function>::Cast(args[1]));
  // obj->callCallback();

  obj->Wrap(args.This());

  obj->poll_handle_.data = obj;
/*int r = */uv_poll_init(uv_default_loop(), &obj->poll_handle_, obj->fd_);
  
  uv_poll_start(&obj->poll_handle_, UV_READABLE, _serialportReadable);

  return args.This();
}

void SerialportPoller::_start() {
  uv_poll_start(&poll_handle_, UV_READABLE, _serialportReadable);
}

void SerialportPoller::_stop() {
  uv_poll_stop(&poll_handle_);
}


Handle<Value> SerialportPoller::Start(const Arguments& args) {
  HandleScope scope;

  SerialportPoller* obj = ObjectWrap::Unwrap<SerialportPoller>(args.This());
  obj->_start();
  
  return scope.Close(Undefined());
}
Handle<Value> SerialportPoller::Close(const Arguments& args) {
  HandleScope scope;

  SerialportPoller* obj = ObjectWrap::Unwrap<SerialportPoller>(args.This());
  obj->_stop();

  // DO SOMETHING!

  return scope.Close(Undefined());
}