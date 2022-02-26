#include "./serialport.h"

#ifdef __APPLE__
  #include "./darwin_list.h"
#endif

#ifdef WIN32
  #define strncasecmp strnicmp
  #include "./serialport_win.h"
#else
  #include "./poller.h"
#endif

Napi::Value getValueFromObject(Napi::Object options, std::string key) {
  Napi::String str = Napi::String::New(options.Env(), key);
  return (options).Get(str);
}

int getIntFromObject(Napi::Object options, std::string key) {
  return getValueFromObject(options, key).ToNumber().Int64Value();
}

bool getBoolFromObject(Napi::Object options, std::string key) {
  return getValueFromObject(options, key).ToBoolean().Value();
}

Napi::String getStringFromObj(Napi::Object options, std::string key) {
  return getValueFromObject(options, key).ToString();
}

double getDoubleFromObject(Napi::Object options, std::string key) {
  return getValueFromObject(options, key).ToNumber().DoubleValue();
}

Napi::Value Open(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // path
  if (!info[0].IsString()) {
    Napi::TypeError::New(env, "First argument must be a string").ThrowAsJavaScriptException();
    return env.Null();
  }
  std::string path = info[0].ToString().Utf8Value();

  // options
  if (!info[1].IsObject()) {
    Napi::TypeError::New(env, "Second argument must be an object").ThrowAsJavaScriptException();
    return env.Null();
  }
  Napi::Object options = info[1].ToObject();

  // callback
  if (!info[2].IsFunction()) {
    Napi::TypeError::New(env, "Third argument must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }
  Napi::Function callback = info[2].As<Napi::Function>();
  OpenBaton* baton = new OpenBaton(callback);
  snprintf(baton->path, sizeof(baton->path), "%s", path.c_str());
  baton->baudRate = getIntFromObject(options, "baudRate");
  baton->dataBits = getIntFromObject(options, "dataBits");
  baton->parity = ToParityEnum(getStringFromObj(options, "parity"));
  baton->stopBits = ToStopBitEnum(getDoubleFromObject(options, "stopBits"));
  baton->rtscts = getBoolFromObject(options, "rtscts");
  baton->rtsMode = ToRtsModeEnum(getStringFromObj(options, "rtsMode"));
  baton->xon = getBoolFromObject(options, "xon");
  baton->xoff = getBoolFromObject(options, "xoff");
  baton->xany = getBoolFromObject(options, "xany");
  baton->hupcl = getBoolFromObject(options, "hupcl");
  baton->lock = getBoolFromObject(options, "lock");

  #ifndef WIN32
    baton->vmin = getIntFromObject(options, "vmin");
    baton->vtime = getIntFromObject(options, "vtime");
  #endif

  baton->Queue();
  return env.Undefined();
}

Napi::Value Update(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // file descriptor
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "First argument must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  int fd = info[0].As<Napi::Number>().Int32Value();

  // options
  if (!info[1].IsObject()) {
    Napi::TypeError::New(env, "Second argument must be an object").ThrowAsJavaScriptException();
    return env.Null();
  }
  Napi::Object options = info[1].ToObject();

  if (!(options).Has("baudRate")) {
    Napi::TypeError::New(env, "\"baudRate\" must be set on options object").ThrowAsJavaScriptException();
    return env.Null();
  }

  // callback
  if (!info[2].IsFunction()) {
    Napi::TypeError::New(env, "Third argument must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::Function callback = info[2].As<Napi::Function>();
  ConnectionOptionsBaton* baton = new ConnectionOptionsBaton(callback);

  baton->fd = fd;
  baton->baudRate = getIntFromObject(options, "baudRate");

  baton->Queue();
  return env.Undefined();
}

Napi::Value Close(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // file descriptor
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "First argument must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }

  // callback
  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Second argument must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::Function callback = info[1].As<Napi::Function>();
  CloseBaton* baton = new CloseBaton(callback);
  baton->fd = info[0].ToNumber().Int64Value();;

  baton->Queue();
  return env.Undefined();
}

Napi::Value Flush(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // file descriptor
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "First argument must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  int fd = info[0].As<Napi::Number>().Int32Value();

  // callback
  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Second argument must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }
  Napi::Function callback = info[1].As<Napi::Function>();

  FlushBaton* baton = new FlushBaton(callback);
  baton->fd = fd;

  baton->Queue();
  return env.Undefined();
}

Napi::Value Set(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // file descriptor
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "First argument must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  int fd = info[0].As<Napi::Number>().Int32Value();

  // options
  if (!info[1].IsObject()) {
    Napi::TypeError::New(env, "Second argument must be an object").ThrowAsJavaScriptException();
    return env.Null();
  }
  Napi::Object options = info[1].ToObject();

  // callback
  if (!info[2].IsFunction()) {
    Napi::TypeError::New(env, "Third argument must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }
  Napi::Function callback = info[2].As<Napi::Function>();

  SetBaton* baton = new SetBaton(callback);
  baton->fd = fd;
  baton->brk = getBoolFromObject(options, "brk");
  baton->rts = getBoolFromObject(options, "rts");
  baton->cts = getBoolFromObject(options, "cts");
  baton->dtr = getBoolFromObject(options, "dtr");
  baton->dsr = getBoolFromObject(options, "dsr");
  baton->lowLatency = getBoolFromObject(options, "lowLatency");

  baton->Queue();
  return env.Undefined();
}

Napi::Value Get(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // file descriptor
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "First argument must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  int fd = info[0].As<Napi::Number>().Int32Value();

  // callback
  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Second argument must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }
  Napi::Function callback = info[1].As<Napi::Function>();

  GetBaton* baton = new GetBaton(callback);
  baton->fd = fd;
  baton->cts = false;
  baton->dsr = false;
  baton->dcd = false;
  baton->lowLatency = false;

  baton->Queue();
  return env.Undefined();
}

Napi::Value GetBaudRate(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // file descriptor
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "First argument must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  int fd = info[0].As<Napi::Number>().Int32Value();

  // callback
  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Second argument must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::Function callback = info[1].As<Napi::Function>();
  GetBaudRateBaton* baton = new GetBaudRateBaton(callback);
  baton->fd = fd;
  baton->baudRate = 0;

  baton->Queue();
  return env.Undefined();
}

Napi::Value Drain(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  // file descriptor
  if (!info[0].IsNumber()) {
    Napi::TypeError::New(env, "First argument must be an int").ThrowAsJavaScriptException();
    return env.Null();
  }
  int fd = info[0].As<Napi::Number>().Int32Value();

  // callback
  if (!info[1].IsFunction()) {
    Napi::TypeError::New(env, "Second argument must be a function").ThrowAsJavaScriptException();
    return env.Null();
  }

  Napi::Function callback = info[1].As<Napi::Function>();
  DrainBaton* baton = new DrainBaton(callback);
  baton->fd = fd;

  baton->Queue();
  return env.Undefined();
}

inline SerialPortParity ToParityEnum(const Napi::String& napistr) {
  auto tmp = napistr.Utf8Value();
  const char* str = tmp.c_str();

  size_t count = strlen(str);
  SerialPortParity parity = SERIALPORT_PARITY_NONE;
  if (!strncasecmp(str, "none", count)) {
    parity = SERIALPORT_PARITY_NONE;
  } else if (!strncasecmp(str, "even", count)) {
    parity = SERIALPORT_PARITY_EVEN;
  } else if (!strncasecmp(str, "mark", count)) {
    parity = SERIALPORT_PARITY_MARK;
  } else if (!strncasecmp(str, "odd", count)) {
    parity = SERIALPORT_PARITY_ODD;
  } else if (!strncasecmp(str, "space", count)) {
    parity = SERIALPORT_PARITY_SPACE;
  }
  return parity;
}

 inline SerialPortStopBits ToStopBitEnum(double stopBits) {
  if (stopBits > 1.4 && stopBits < 1.6) {
    return SERIALPORT_STOPBITS_ONE_FIVE;
  }
  if (stopBits == 2) {
    return SERIALPORT_STOPBITS_TWO;
  }
  return SERIALPORT_STOPBITS_ONE;
}

inline SerialPortRtsMode ToRtsModeEnum(const Napi::String& napistr) {
  auto tmp = napistr.Utf8Value();
  const char* str = tmp.c_str();

  size_t count = strlen(str);
  SerialPortRtsMode mode = SERIALPORT_RTSMODE_HANDSHAKE;
  if (!strncasecmp(str, "enable", count)) {
    mode = SERIALPORT_RTSMODE_ENABLE;
  } else if (!strncasecmp(str, "handshake", count)) {
    mode = SERIALPORT_RTSMODE_HANDSHAKE;
  } else if (!strncasecmp(str, "toggle", count)) {
    mode = SERIALPORT_RTSMODE_TOGGLE;
  }
  return mode;
}

Napi::Object init(Napi::Env env, Napi::Object exports) {
  exports.Set("set", Napi::Function::New(env, Set));
  exports.Set("get", Napi::Function::New(env, Get));
  exports.Set("getBaudRate", Napi::Function::New(env, GetBaudRate));
  exports.Set("open", Napi::Function::New(env, Open));
  exports.Set("update", Napi::Function::New(env, Update));
  exports.Set("close", Napi::Function::New(env, Close));
  exports.Set("flush", Napi::Function::New(env, Flush));
  exports.Set("drain", Napi::Function::New(env, Drain));

  #ifdef __APPLE__
  exports.Set("list", Napi::Function::New(env, List));
  #endif

  #ifdef WIN32
  exports.Set("write", Napi::Function::New(env, Write));
  exports.Set("read", Napi::Function::New(env, Read));
  exports.Set("list", Napi::Function::New(env, List));
  #else
  Poller::Init(env, exports);
  #endif
  return exports;
}

NODE_API_MODULE(serialport, init);
