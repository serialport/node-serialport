#ifndef PACKAGES_SERIALPORT_SRC_POLLER_H_
#define PACKAGES_SERIALPORT_SRC_POLLER_H_

#include <napi.h>
#include <uv.h>

class Poller : public Napi::ObjectWrap<Poller> {
 public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  explicit Poller(const Napi::CallbackInfo &info);
  static Napi::Value New(const Napi::CallbackInfo& info);
  static void onData(uv_poll_t* handle, int status, int events);
  static void onClose(uv_handle_t* poll_handle);
  ~Poller();

 private:
  int fd;
  uv_poll_t* poll_handle = nullptr;
	Napi::FunctionReference callback;
  bool uv_poll_init_success = false;

  // can this be read off of poll_handle?
  int events = 0;

  void poll(Napi::Env env, int events);
  void stop(Napi::Env env);
  int _stop();

  Napi::Value poll(const Napi::CallbackInfo& info);
  Napi::Value stop(const Napi::CallbackInfo& info);
  Napi::Value destroy(const Napi::CallbackInfo& info);
  static inline Napi::FunctionReference & constructor();
};

#endif  // PACKAGES_SERIALPORT_SRC_POLLER_H_