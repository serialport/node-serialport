// Copyright (C) 2013 Robert Giseburt <giseburt@gmail.com>
// serialport_poller.cpp Written as a part of https://github.com/voodootikigod/node-serialport
// License to use this is the same as that of node-serialport.

#include <nan.h>
#include "./serialport_poller.h"

using namespace v8;

static Nan::Persistent<v8::FunctionTemplate> serialportpoller_constructor;

SerialportPoller::SerialportPoller() :  Nan::ObjectWrap() {}
SerialportPoller::~SerialportPoller() {
  // printf("~SerialportPoller\n");
  delete callback_;
}

void _serialportReadable(uv_poll_t *req, int status, int events) {
  SerialportPoller* sp = (SerialportPoller*) req->data;
  // We can stop polling until we have read all of the data...
  sp->_stop();
  sp->callCallback(status);
}

void SerialportPoller::callCallback(int status) {
  Nan::HandleScope scope;
  // uv_work_t* req = new uv_work_t;

  // Call the callback to go read more data...

  v8::Local<v8::Value> argv[1];
  if (status != 0) {
    // error handling changed in libuv, see:
    // https://github.com/joyent/libuv/commit/3ee4d3f183331
    #ifdef UV_ERRNO_H_
    const char* err_string = uv_strerror(status);
    #else
    uv_err_t errno = uv_last_error(uv_default_loop());
    const char* err_string = uv_strerror(errno);
    #endif
    snprintf(this->errorString, sizeof(this->errorString), "Error %s on polling", err_string);
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(this->errorString).ToLocalChecked());
  } else {
    argv[0] = Nan::Undefined();
  }

  callback_->Call(1, argv);
}



void SerialportPoller::Init(Handle<Object> target) {
  Nan::HandleScope scope;

  // Prepare constructor template
  Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(New);
  tpl->SetClassName(Nan::New<String>("SerialportPoller").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);


  // Prototype

  // SerialportPoller.close()
  Nan::SetPrototypeTemplate(tpl, "close",
      Nan::GetFunction(Nan::New<FunctionTemplate>(Close)).ToLocalChecked());

  // SerialportPoller.start()
  Nan::SetPrototypeTemplate(tpl, "start",
      Nan::GetFunction(Nan::New<FunctionTemplate>(Start)).ToLocalChecked());

  serialportpoller_constructor.Reset(tpl);

  Nan::Set(target, Nan::New<String>("SerialportPoller").ToLocalChecked(), Nan::GetFunction(tpl).ToLocalChecked());
}

NAN_METHOD(SerialportPoller::New) {
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("First argument must be an fd");
    return;
  }

  if (!info[1]->IsFunction()) {
    Nan::ThrowTypeError("Third argument must be a function");
    return;
  }

  SerialportPoller* obj = new SerialportPoller();
  obj->fd_ = info[0]->ToInt32()->Int32Value();
  obj->callback_ = new Nan::Callback(info[1].As<v8::Function>());
  // obj->callCallback();

  obj->Wrap(info.This());

  obj->poll_handle_.data = obj;

  uv_poll_init(uv_default_loop(), &obj->poll_handle_, obj->fd_);

  uv_poll_start(&obj->poll_handle_, UV_READABLE, _serialportReadable);

  info.GetReturnValue().Set(info.This());
}

void SerialportPoller::_start() {
  uv_poll_start(&poll_handle_, UV_READABLE, _serialportReadable);
}

void SerialportPoller::_stop() {
  uv_poll_stop(&poll_handle_);
}


NAN_METHOD(SerialportPoller::Start) {
  SerialportPoller* obj = Nan::ObjectWrap::Unwrap<SerialportPoller>(info.This());
  obj->_start();

  return;
}

NAN_METHOD(SerialportPoller::Close) {
  SerialportPoller* obj = Nan::ObjectWrap::Unwrap<SerialportPoller>(info.This());
  obj->_stop();

  // DO SOMETHING!

  return;
}
