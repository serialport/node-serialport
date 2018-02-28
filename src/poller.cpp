#include <nan.h>
#include "./poller.h"

Poller::Poller(int fd) {
  Nan::HandleScope scope;
  this->fd = fd;
  this->poll_handle = new uv_poll_t();
  memset(this->poll_handle, 0, sizeof(uv_poll_t));
  poll_handle->data = this;
  int status = uv_poll_init(uv_default_loop(), poll_handle, fd);
  if (0 != status) {
    Nan::ThrowError(uv_strerror(status));
    return;
  }
  uv_poll_init_success = true;
}

Poller::~Poller() {
  // if we call uv_poll_stop after uv_poll_init failed we segfault
  if (uv_poll_init_success) {
    uv_poll_stop(poll_handle);
    uv_close(reinterpret_cast<uv_handle_t*> (poll_handle), Poller::onClose);
  } else {
    delete poll_handle;
  }
}

void Poller::onClose(uv_handle_t* poll_handle) {
  // fprintf(stdout, "~Poller is closed\n");
  delete poll_handle;
}

// Events can be UV_READABLE | UV_WRITABLE | UV_DISCONNECT
void Poller::poll(int events) {
  // fprintf(stdout, "Poller:poll for %d\n", events);
  this->events = this->events | events;
  int status = uv_poll_start(poll_handle, events, Poller::onData);
  if (0 != status) {
    Nan::ThrowTypeError(uv_strerror(status));
    return;
  }
}

void Poller::stop() {
  int status = uv_poll_stop(poll_handle);
  if (0 != status) {
    Nan::ThrowTypeError(uv_strerror(status));
    return;
  }
}

void Poller::onData(uv_poll_t* handle, int status, int events) {
  Nan::HandleScope scope;
  Poller* obj = static_cast<Poller*>(handle->data);
  v8::Local<v8::Value> argv[2];
  if (0 != status) {
    // fprintf(stdout, "OnData Error status=%s events=%d\n", uv_strerror(status), events);
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(uv_strerror(status)).ToLocalChecked());
    argv[1] = Nan::Undefined();
  } else {
    // fprintf(stdout, "OnData status=%d events=%d\n", status, events);
    argv[0] = Nan::Null();
    argv[1] = Nan::New<v8::Integer>(events);
  }
  // remove triggered events from the poll
  int newEvents = obj->events & ~events;
  obj->poll(newEvents);

  obj->callback.Call(2, argv);
}

NAN_MODULE_INIT(Poller::Init) {
  v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
  tpl->SetClassName(Nan::New("Poller").ToLocalChecked());
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  Nan::SetPrototypeMethod(tpl, "poll", poll);
  Nan::SetPrototypeMethod(tpl, "stop", stop);

  constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  Nan::Set(target, Nan::New("Poller").ToLocalChecked(), Nan::GetFunction(tpl).ToLocalChecked());
}

NAN_METHOD(Poller::New) {
  if (!info.IsConstructCall()) {
    const int argc = 2;
    v8::Local<v8::Value> argv[argc] = {info[0], info[1]};
    v8::Local<v8::Function> cons = Nan::New(constructor());
    info.GetReturnValue().Set(Nan::NewInstance(cons, argc, argv).ToLocalChecked());
    return;
  }

  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("fd must be an int");
    return;
  }
  int fd = Nan::To<int>(info[0]).FromJust();

  if (!info[1]->IsFunction()) {
    Nan::ThrowTypeError("cb must be a function");
    return;
  }

  Poller *obj = new Poller(fd);
  obj->callback.Reset(info[1].As<v8::Function>());
  obj->Wrap(info.This());
  info.GetReturnValue().Set(info.This());
}

NAN_METHOD(Poller::poll) {
  Poller* obj = Nan::ObjectWrap::Unwrap<Poller>(info.Holder());
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("events must be an int");
    return;
  }
  int events = Nan::To<int>(info[0]).FromJust();
  obj->poll(events);
}

NAN_METHOD(Poller::stop) {
  Poller* obj = Nan::ObjectWrap::Unwrap<Poller>(info.Holder());
  obj->stop();
}

inline Nan::Persistent<v8::Function> & Poller::constructor() {
  static Nan::Persistent<v8::Function> my_constructor;
  return my_constructor;
}
