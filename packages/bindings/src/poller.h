#ifndef PACKAGES_SERIALPORT_SRC_POLLER_H_
#define PACKAGES_SERIALPORT_SRC_POLLER_H_

#include <napi.h>
#include <uv.h>

class Poller : public Napi::ObjectWrap<Poller> { //}, public Napi::AsyncWorker {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  static void onData(napi_env env, uv_poll_t* handle, int status, int events);
  static void onClose(napi_env env, uv_handle_t* poll_handle);

 private:
  int fd;
  uv_poll_t* poll_handle;
  Napi::FunctionReference callback;
  bool uv_poll_init_success = false;

  // can this be read off of poll_handle?
  int events = 0;

  explicit Poller(int fd);
  ~Poller();
  void poll(napi_env n_env, int events);
  void stop();
  int _stop();

  static Napi::Value New(const Napi::CallbackInfo& info);
  static Napi::Value poll(const Napi::CallbackInfo& info);
  static Napi::Value stop(const Napi::CallbackInfo& info);
  static Napi::Value destroy(const Napi::CallbackInfo& info);
  static inline Napi::FunctionReference & constructor();
};

#endif  // PACKAGES_SERIALPORT_SRC_POLLER_H_
