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
  SerialportPoller* sp = (SerialportPoller*) req->data;
  // We can stop polling until we have read all of the data...
  sp->_stop();
  sp->callCallback(status);
}

void SerialportPoller::callCallback(int status) {
  // uv_work_t* req = new uv_work_t;

  // Call the callback to go read more data...

  v8::Handle<v8::Value> argv[1];
  if(status != 0) {
    // error handling changed in libuv, see:
    // https://github.com/joyent/libuv/commit/3ee4d3f183331
    #ifdef UV_ERRNO_H_
    const char* err_string = uv_strerror(status);
    #else
    uv_err_t errno = uv_last_error(uv_default_loop());
    const char* err_string = uv_strerror(errno);
    #endif
    snprintf(this->errorString, sizeof(this->errorString), "Error %s on polling", err_string);
    argv[0] = v8::Exception::Error(NanNew<v8::String>(this->errorString));
  } else {
    argv[0] = NanUndefined();
  }

  callback_->Call(1, argv);
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
