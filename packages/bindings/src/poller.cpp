#include <napi.h>
#include <uv.h>
#include "./poller.h"

Poller::Poller(int fd) { //}: Napi::AsyncWorker(callback, "node-serialport:poller") {
  Napi::HandleScope scope(env);
  this->fd = fd;
  this->poll_handle = new uv_poll_t();
  memset(this->poll_handle, 0, sizeof(uv_poll_t));
  poll_handle->data = this;
  int status = uv_poll_init(uv_default_loop(), poll_handle, fd);
  if (0 != status) {
    Napi::Error::New(env, uv_strerror(status)).ThrowAsJavaScriptException();
    return env.Null();
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

void Poller::onClose(napi_env env, uv_handle_t* poll_handle) {
  // fprintf(stdout, "~Poller is closed\n");
  delete poll_handle;
}

// Events can be UV_READABLE | UV_WRITABLE | UV_DISCONNECT
void Poller::poll(napi_env n_env, int events) {
  Napi::Env env = Napi::Env::Env(n_env);
  // fprintf(stdout, "Poller:poll for %d\n", events);
  this->events = this->events | events;
  int status = uv_poll_start(poll_handle, events, Poller::onData);
  if (0 != status) {
    Napi::TypeError::New(env, uv_strerror(status)).ThrowAsJavaScriptException();
    return env.Null();
  }
}

void Poller::stop() {
  int status = uv_poll_stop(poll_handle);
  if (0 != status) {
    Napi::TypeError::New(env, uv_strerror(status)).ThrowAsJavaScriptException();
    return env.Null();
  }
}

int Poller::_stop() {
  return uv_poll_stop(poll_handle);
}

void Poller::onData(napi_env n_env, uv_poll_t* handle, int status, int events) {
  Napi::Env env = Napi::Env::Env(n_env);
  Napi::HandleScope scope(env);
  Poller* obj = static_cast<Poller*>(handle->data);
  std::vector<napi_value> args;
  args.reserve(2);

  // if Error
  if (0 != status) {
    // fprintf(stdout, "OnData Error status=%s events=%d\n", uv_strerror(status), events);
    args.push_back(Napi::String::New(env, uv_strerror(status)));
    args.push_back(env.Undefined());
    obj->_stop(); // doesn't matter if this errors
  } else {
    // fprintf(stdout, "OnData status=%d events=%d subscribed=%d\n", status, events, obj->events);
    args.push_back(env.Null());
    args.push_back(Napi::Number::New(env, events));
    // remove triggered events from the poll
    int newEvents = obj->events & ~events;
    obj->poll(newEvents);
  }

  obj->callback.Call(args);
}

Napi::Object Poller::Init(Napi::Env env, Napi::Object exports) {
  Napi::FunctionReference tpl = Napi::Function::New(env, New);
  tpl->SetClassName(Napi::String::New(env, "Poller"));


  InstanceMethod("poll", &poll),
  InstanceMethod("stop", &stop),
  InstanceMethod("destroy", &destroy),

  constructor().Reset(Napi::GetFunction(tpl));
  (target).Set(Napi::String::New(env, "Poller"), Napi::GetFunction(tpl));
}

Napi::Value Poller::New(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!info.IsConstructCall()) {
    const int argc = 2;
    Napi::Value argv[argc] = {info[0], info[1]};
    Napi::Function cons = Napi::New(env, constructor());
    return Napi::NewInstance(cons, argc, argv);
    return;
  }

  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "fd must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  int fd = info[0].As<Napi::Number>().Int32Value();

  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "cb must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }

  Poller *obj = new Poller(fd);
  obj->callback.Reset(info[1].As<Napi::Function>());
  obj->Wrap(info.This());
  return info.This();
}

Napi::Value Poller::poll(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Poller* obj = info.Holder().Unwrap<Poller>();
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "events must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  int events = info[0].As<Napi::Number>().Int32Value();
  obj->poll(events);
}

Napi::Value Poller::stop(const Napi::CallbackInfo& info) {
  Poller* obj = info.Holder().Unwrap<Poller>();
  obj->stop();
}

Napi::Value Poller::destroy(const Napi::CallbackInfo& info) {
  Poller* obj = info.Holder().Unwrap<Poller>();
  obj->persistent().Reset();
  delete obj;
}

inline Napi::FunctionReference & Poller::constructor() {
  static Napi::FunctionReference my_constructor;
  return my_constructor;
}
