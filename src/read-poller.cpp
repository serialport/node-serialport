// Copyright (C) 2013 Robert Giseburt <giseburt@gmail.com>
// poller.cpp Written as a part of https://github.com/voodootikigod/node-serialport
// License to use this is the same as that of node-serialport.

#include <nan.h>
#include "./read-poller.h"

using namespace v8;

static Nan::Persistent<v8::FunctionTemplate> poller_constructor;

void ReadPoller::Init(Handle<Object> target) {
  Nan::HandleScope scope;

  // Prepare constructor template
  Local<FunctionTemplate> tpl = Nan::New<FunctionTemplate>(New);
  tpl->SetClassName(Nan::New<String>("ReadPoller").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  // ReadPoller.close()
  Nan::SetPrototypeMethod(tpl, "close", Close);
  poller_constructor.Reset(tpl);

  Nan::Set(target, Nan::New<String>("ReadPoller").ToLocalChecked(), Nan::GetFunction(tpl).ToLocalChecked());
}

ReadPoller::ReadPoller() :  Nan::ObjectWrap() {}
ReadPoller::~ReadPoller() {
  // printf("~ReadPoller\n");
  // _close();
}

void _serialportReadable(uv_poll_t *req, int status, int events) {
  ReadPoller* sp = (ReadPoller*) req->data;
  // We can stop polling until we have read all of the data...
  sp->callCallback(status);
  sp->_close();
}

void ReadPoller::callCallback(int status) {
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

NAN_METHOD(ReadPoller::New) {
  // printf("ReadPoller\n");
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("First argument must be an integer file descriptor");
    return;
  }

  if (!info[1]->IsFunction()) {
    Nan::ThrowTypeError("Second argument must be a function");
    return;
  }

  ReadPoller* obj = new ReadPoller();
  obj->fd_ = Nan::To<v8::Int32>(info[0]).ToLocalChecked()->Value();
  obj->callback_ = new Nan::Callback(info[1].As<v8::Function>());
  obj->Wrap(info.This());
  obj->poll_handle_.data = obj;

  uv_poll_init(uv_default_loop(), &obj->poll_handle_, obj->fd_);
  uv_poll_start(&obj->poll_handle_, UV_READABLE, _serialportReadable);

  info.GetReturnValue().Set(info.This());
}

void ReadPoller::_close() {
  // printf("ReadPoller::_close\n");
  uv_poll_stop(&poll_handle_);
  delete callback_;
}

NAN_METHOD(ReadPoller::Close) {
  ReadPoller* obj = Nan::ObjectWrap::Unwrap<ReadPoller>(info.This());
  obj->_close();
  return;
}
