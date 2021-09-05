#include <napi.h>
#include <uv.h>
#include "./poller.h"

Poller::Poller (const Napi::CallbackInfo& info) : Napi::ObjectWrap<Poller>(info) //: Napi::AsyncWorker(callback, "node-serialport:poller"), 
  {
  auto env = Env();
  Napi::HandleScope scope(env);
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "First argument must be an int").ThrowAsJavaScriptException();
    return;
  }
  this->fd = info[0].As<Napi::Number>().Int32Value();

  this->poll_handle = new uv_poll_t();
  memset(this->poll_handle, 0, sizeof(uv_poll_t));
  poll_handle->data = this;
  int status = uv_poll_init(uv_default_loop(), poll_handle, fd);
  if (0 != status) {
    Napi::Error::New(env, uv_strerror(status)).ThrowAsJavaScriptException();
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
  auto env = Env();
  // fprintf(stdout, "Poller:poll for %d\n", events);
  this->events = this->events | events;
  int status = uv_poll_start(poll_handle, events, Poller::onData);
  if (0 != status) {
    Napi::TypeError::New(env, uv_strerror(status)).ThrowAsJavaScriptException();
    return;
  }
}

void Poller::stop() {
  auto env = Env();
  int status = uv_poll_stop(poll_handle);
  if (0 != status) {
    Napi::TypeError::New(env, uv_strerror(status)).ThrowAsJavaScriptException();
    return;
  }
}

int Poller::_stop() {
  return uv_poll_stop(poll_handle);
}

void Poller::onData(uv_poll_t* handle, int status, int events) {
  // TODO FIX
  // auto env = Env();
  // Napi::HandleScope scope(env);
  Poller* obj = static_cast<Poller*>(handle->data);
  auto env = obj->Env();
  Napi::HandleScope scope(env);
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
  Napi::Function func = DefineClass(env, "Poller", {
    StaticMethod<&Poller::New>("New"),
    InstanceMethod<&Poller::poll>("poll"),
    InstanceMethod<&Poller::stop>("stop"),
    InstanceMethod<&Poller::destroy>("destroy"),
  });

  Napi::FunctionReference* constructor = new Napi::FunctionReference();

  *constructor = Napi::Persistent(func);
  exports.Set("Poller", func);

  env.SetInstanceData<Napi::FunctionReference>(constructor);

  return exports;
}

Napi::Value Poller::New(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (!info.IsConstructCall()) {

    Napi::FunctionReference* constructor = info.Env().GetInstanceData<Napi::FunctionReference>();
    return constructor->New({info[0], info[1]});
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

  Napi::Function callback = info[1].As<Napi::Function>();
  Poller *obj = new Poller(info); //, fd);
  // TODO FIX
  // ObjectReference obj->Wrap(info.This());
  // return info.This();
}

Napi::Value Poller::poll(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Poller* obj = this;
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "events must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  int events = info[0].As<Napi::Number>().Int32Value();
  obj->poll(events);
}

Napi::Value Poller::stop(const Napi::CallbackInfo& info) {
  this->stop();
}

Napi::Value Poller::destroy(const Napi::CallbackInfo& info) {
  Poller* obj = this;
  delete obj;
}

inline Napi::FunctionReference & Poller::constructor() {
  static Napi::FunctionReference my_constructor;
  return my_constructor;
}
