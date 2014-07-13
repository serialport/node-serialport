// Copyright (C) 2013 Robert Giseburt <giseburt@gmail.com>
// serialport_poller.cpp Written as a part of https://github.com/voodootikigod/node-serialport
// License to use this is the same as that of node-serialport.

#include <nan.h>
#include "serialport_poller.h"

using namespace v8;

static v8::Persistent<v8::FunctionTemplate> serialportpoller_constructor;

SerialportPoller::SerialportPoller() :  ObjectWrap() {};
SerialportPoller::~SerialportPoller() {
  // printf("~SerialportPoller\n");
  delete callback_;
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
  callback_->Call(0, NULL); //2, argv
}

void SerialportPoller::Init(Handle<Object> target) {
  NanScope();

  // Prepare constructor template
  Local<FunctionTemplate> tpl = NanNew<FunctionTemplate>(New);
  tpl->SetClassName(NanNew<String>("SerialportPoller"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);


  // Prototype

  // SerialportPoller.close()
  tpl->PrototypeTemplate()->Set(NanNew<String>("close"),
      NanNew<FunctionTemplate>(Close)->GetFunction());

  // SerialportPoller.start()
  tpl->PrototypeTemplate()->Set(NanNew<String>("start"),
      NanNew<FunctionTemplate>(Start)->GetFunction());

  NanAssignPersistent<FunctionTemplate>(serialportpoller_constructor, tpl);

  target->Set(NanNew<String>("SerialportPoller"), tpl->GetFunction());
}

NAN_METHOD(SerialportPoller::New) {
  NanScope();

  SerialportPoller* obj = new SerialportPoller();

  if(!args[0]->IsInt32()) {
    NanThrowTypeError("First argument must be an fd");
    NanReturnUndefined();
  }
  obj->fd_ = args[0]->ToInt32()->Int32Value();

  if(!args[1]->IsFunction()) {
    NanThrowTypeError("Third argument must be a function");
    NanReturnUndefined();
  }
  obj->callback_ = new NanCallback(args[1].As<v8::Function>());
  // obj->callCallback();

  obj->Wrap(args.This());

  obj->poll_handle_.data = obj;
/*int r = */uv_poll_init(uv_default_loop(), &obj->poll_handle_, obj->fd_);
  
  uv_poll_start(&obj->poll_handle_, UV_READABLE, _serialportReadable);

  NanReturnValue(args.This());
}

void SerialportPoller::_start() {
  uv_poll_start(&poll_handle_, UV_READABLE, _serialportReadable);
}

void SerialportPoller::_stop() {
  uv_poll_stop(&poll_handle_);
}


NAN_METHOD(SerialportPoller::Start) {
  NanScope();

  SerialportPoller* obj = ObjectWrap::Unwrap<SerialportPoller>(args.This());
  obj->_start();
  
  NanReturnUndefined();
}
NAN_METHOD(SerialportPoller::Close) {
  NanScope();

  SerialportPoller* obj = ObjectWrap::Unwrap<SerialportPoller>(args.This());
  obj->_stop();

  // DO SOMETHING!

  NanReturnUndefined();
}
