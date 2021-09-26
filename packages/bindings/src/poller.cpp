#include <napi.h>
#include <uv.h>
#include "./poller.h"

Poller::Poller (const Napi::CallbackInfo &info) : Napi::ObjectWrap<Poller>(info)
  {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "First argument must be an int").ThrowAsJavaScriptException();
    return;
  }
  this->fd = info[0].As<Napi::Number>().Int32Value();

  // callback
  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Second argument must be a function").ThrowAsJavaScriptException();
    return;
  }
  this->callback = Napi::Persistent(info[1].As<Napi::Function>());

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
    uv_unref(reinterpret_cast<uv_handle_t*> (poll_handle));
    uv_close(reinterpret_cast<uv_handle_t*> (poll_handle), Poller::onClose);
  } else {
    delete poll_handle;
  }
  return;
}

void Poller::onClose(uv_handle_t* poll_handle) {
  // fprintf(stdout, "~Poller is closed\n");
  delete poll_handle;
}

// Events can be UV_READABLE | UV_WRITABLE | UV_DISCONNECT
void Poller::poll(Napi::Env env, int events) {
  Napi::HandleScope scope(env);
  // fprintf(stdout, "Poller:poll for %d\n", events);
  this->events = this->events | events;
  int status = uv_poll_start(this->poll_handle, events, Poller::onData);
  if (0 != status) {
    Napi::Error::New(env, uv_strerror(status)).ThrowAsJavaScriptException();
  }
  return;
}

void Poller::stop(Napi::Env env) {
  Napi::HandleScope scope(env);
  int status = uv_poll_stop(this->poll_handle);
  if (0 != status) {
    Napi::Error::New(env, uv_strerror(status)).ThrowAsJavaScriptException();
  }
  return;
}

int Poller::_stop() {
  return uv_poll_stop(poll_handle);
}

void Poller::onData(uv_poll_t* handle, int status, int events) {
  Poller* obj = static_cast<Poller*>(handle->data);
  Napi::Env env = obj->Env();
  Napi::HandleScope scope(env);

  // if Error
  if (0 != status) {
    // fprintf(stdout, "OnData Error status=%s events=%d\n", uv_strerror(status), events);
    obj->_stop(); // doesn't matter if this errors
    obj->callback.Call({Napi::Error::New(env, uv_strerror(status)).Value(), env.Undefined()});
  } else {
    // fprintf(stdout, "OnData status=%d events=%d subscribed=%d\n", status, events, obj->events);
    // remove triggered events from the poll
    int newEvents = obj->events & ~events;
    obj->poll(env, newEvents);
    obj->callback.Call({env.Null(), Napi::Number::New(env, events)});
  }

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
  Napi::HandleScope scope(env);

  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "fd must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  Napi::Value  fd = info[0];
  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "cb must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }
  Napi::Function callback = info[1].As<Napi::Function>();
  Napi::FunctionReference* constructor = info.Env().GetInstanceData<Napi::FunctionReference>();
  return constructor->New({fd, callback});
}

Napi::Value Poller::poll(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
  Poller* obj = this;
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "events must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  int events = info[0].As<Napi::Number>().Int32Value();
  obj->poll(env, events);
  return env.Undefined();
}

Napi::Value Poller::stop(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
  this->stop(env);
  return env.Undefined();
}

Napi::Value Poller::destroy(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::HandleScope scope(env);
  Poller* obj = this;
  // TODO Fix destruction Segfault
  obj->Reset();
  // delete obj;
  return env.Undefined();
}

inline Napi::FunctionReference & Poller::constructor() {
  static Napi::FunctionReference my_constructor;
  // TODO Check if required
  // my_constructor.SuppressDestruct();
  return my_constructor;
}
