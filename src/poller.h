#ifndef SRC_POLLER_H_
#define SRC_POLLER_H_

#include <nan.h>

class Poller : public Nan::ObjectWrap {
 public:
  static NAN_MODULE_INIT(Init);
  static void onData(uv_poll_t* handle, int status, int events);
  static void onClose(uv_handle_t* poll_handle);

 private:
  int fd;
  uv_poll_t* poll_handle;
  Nan::Callback callback;
  bool uv_poll_init_success = false;

  // can this be read off of poll_handle?
  int events = 0;

  explicit Poller(int fd);
  ~Poller();
  void poll(int events);
  void stop();

  static NAN_METHOD(New);
  static NAN_METHOD(poll);
  static NAN_METHOD(stop);
  static inline Nan::Persistent<v8::Function> & constructor();
};

#endif  // SRC_POLLER_H_
