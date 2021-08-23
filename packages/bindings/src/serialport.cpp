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

  OpenBaton* baton = new OpenBaton();
  snprintf(baton->path, sizeof(baton->path), "%s", path.c_str());
  baton->baudRate = getIntFromObject(options, "baudRate");
  baton->dataBits = getIntFromObject(options, "dataBits");
  baton->parity = ToParityEnum(getStringFromObj(options, "parity"));
  baton->stopBits = ToStopBitEnum(getDoubleFromObject(options, "stopBits"));
  baton->rtscts = getBoolFromObject(options, "rtscts");
  baton->xon = getBoolFromObject(options, "xon");
  baton->xoff = getBoolFromObject(options, "xoff");
  baton->xany = getBoolFromObject(options, "xany");
  baton->hupcl = getBoolFromObject(options, "hupcl");
  baton->lock = getBoolFromObject(options, "lock");
  baton->callback.Reset(info[2].As<Napi::Function>());

  #ifndef WIN32
    baton->vmin = getIntFromObject(options, "vmin");
    baton->vtime = getIntFromObject(options, "vtime");
  #endif

  napi_value resource_name;
  napi_create_string_utf8(env, "Open", NAPI_AUTO_LENGTH, &resource_name);
  napi_create_async_work(env, NULL, resource_name, EIO_Open, EIO_AfterOpen, baton, &baton->work);
  napi_queue_async_work(env, baton->work);
  return env.Undefined();
}

void EIO_AfterOpen(napi_env n_env, napi_status status, void* req) {
  Napi::Env env = Napi::Env::Env(n_env);
  Napi::HandleScope scope(env);

  OpenBaton* data = (OpenBaton*)req;

  std::vector<napi_value> args;
  args.reserve(2);
  if (data->errorString[0]) {
    args.push_back(Napi::String::New(env, data->errorString));
    args.push_back(env.Undefined());
  } else {
    args.push_back(env.Null());
    args.push_back(Napi::Number::New(env, data->result));
  }

  data->callback.Call(args);
  napi_delete_async_work(env, data->work);
  free(data);
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

  ConnectionOptionsBaton* baton = new ConnectionOptionsBaton();

  baton->fd = fd;
  baton->baudRate = getIntFromObject(options, "baudRate");
  baton->callback.Reset(info[2].As<Napi::Function>());

  napi_value resource_name;
  napi_create_string_utf8(env, "Update", NAPI_AUTO_LENGTH, &resource_name);
  napi_create_async_work(env, NULL, resource_name, EIO_Update, EIO_AfterUpdate, baton, &baton->work);
  napi_queue_async_work(env, baton->work);
  return env.Undefined();
}

void EIO_AfterUpdate(napi_env n_env, napi_status status, void* req) {
  Napi::Env env = Napi::Env::Env(n_env);
  Napi::HandleScope scope(env);

  ConnectionOptionsBaton* data = (ConnectionOptionsBaton*)req;

  std::vector<napi_value> args;
  args.reserve(1);
  if (data->errorString[0]) {
    args.push_back(Napi::String::New(env, data->errorString));
  } else {
    args.push_back(env.Null());
  }

  data->callback.Call(args);
  
  napi_delete_async_work(env, data->work);
  free(data);
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

  VoidBaton* baton = new VoidBaton();
  baton->fd = info[0].ToNumber().Int64Value();;
  baton->callback.Reset(info[1].As<Napi::Function>());
  
  napi_value resource_name;
  napi_create_string_utf8(env, "Close", NAPI_AUTO_LENGTH, &resource_name);
  napi_create_async_work(env, NULL, resource_name, EIO_Close, EIO_AfterClose, baton, &baton->work);
  napi_queue_async_work(env, baton->work);
  return env.Undefined();
}

void EIO_AfterClose(napi_env n_env, napi_status status, void* req) {
    Napi::Env env = Napi::Env::Env(n_env);
  Napi::HandleScope scope(env);
  VoidBaton* data = (VoidBaton*)req;

  std::vector<napi_value> args;
  args.reserve(1);
  if (data->errorString[0]) {
    args.push_back(Napi::String::New(env, data->errorString));
  } else {
    args.push_back(env.Null());
  }
  data->callback.Call(args);

  napi_delete_async_work(env, data->work);
  free(data);
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

  VoidBaton* baton = new VoidBaton();
  baton->fd = fd;
  baton->callback.Reset(callback);

  napi_value resource_name;
  napi_create_string_utf8(env, "Flush", NAPI_AUTO_LENGTH, &resource_name);
  napi_create_async_work(env, NULL, resource_name, EIO_Flush, EIO_AfterFlush, baton, &baton->work);
  napi_queue_async_work(env, baton->work);
  return env.Undefined();
}

void EIO_AfterFlush(napi_env n_env, napi_status status, void* req) {
    Napi::Env env = Napi::Env::Env(n_env);
  Napi::HandleScope scope(env);

  VoidBaton* data = (VoidBaton*)req;

  std::vector<napi_value> args;
  args.reserve(1);

  if (data->errorString[0]) {
    args.push_back(Napi::String::New(env, data->errorString));
  } else {
    args.push_back(env.Null());
  }

  data->callback.Call(args);

  napi_delete_async_work(env, data->work);
  free(data);
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

  SetBaton* baton = new SetBaton();
  baton->fd = fd;
  baton->callback.Reset(callback);
  baton->brk = getBoolFromObject(options, "brk");
  baton->rts = getBoolFromObject(options, "rts");
  baton->cts = getBoolFromObject(options, "cts");
  baton->dtr = getBoolFromObject(options, "dtr");
  baton->dsr = getBoolFromObject(options, "dsr");
  baton->lowLatency = getBoolFromObject(options, "lowLatency");
  
  napi_value resource_name;
  napi_create_string_utf8(env, "Set", NAPI_AUTO_LENGTH, &resource_name);
  napi_create_async_work(env, NULL, resource_name, EIO_Set, EIO_AfterSet, baton, &baton->work);
  napi_queue_async_work(env, baton->work);
  return env.Undefined();
}

void EIO_AfterSet(napi_env n_env, napi_status status, void* req) {
  Napi::Env env = Napi::Env::Env(n_env);
  Napi::HandleScope scope(env);

  SetBaton* data = (SetBaton*)req;

  std::vector<napi_value> args;
  args.reserve(2);

  if (data->errorString[0]) {
    args.push_back(Napi::String::New(env, data->errorString));
  } else {
    args.push_back(env.Null());
  }
  data->callback.Call(args);

  napi_delete_async_work(env, data->work);
  free(data);
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

  GetBaton* baton = new GetBaton();
  baton->fd = fd;
  baton->cts = false;
  baton->dsr = false;
  baton->dcd = false;
  baton->lowLatency = false;
  baton->callback.Reset(info[1].As<Napi::Function>());

  napi_value resource_name;
  napi_create_string_utf8(env, "Get", NAPI_AUTO_LENGTH, &resource_name);
  napi_create_async_work(env, NULL, resource_name, EIO_Get, EIO_AfterGet, baton, &baton->work);
  napi_queue_async_work(env, baton->work);
  return env.Undefined();
}

void EIO_AfterGet(napi_env n_env, napi_status status, void* req) {
  Napi::Env env = Napi::Env::Env(n_env);
  Napi::HandleScope scope(env);

  GetBaton* data = (GetBaton*)req;

  std::vector<napi_value> args;
  args.reserve(2);

  if (data->errorString[0]) {
    args.push_back(Napi::String::New(env, data->errorString));
    args.push_back(env.Undefined());
  } else {
    Napi::Object results = Napi::Object::New(env);
    (results).Set(Napi::String::New(env, "cts"), Napi::Boolean::New(env, data->cts));
    (results).Set(Napi::String::New(env, "dsr"), Napi::Boolean::New(env, data->dsr));
    (results).Set(Napi::String::New(env, "dcd"), Napi::Boolean::New(env, data->dcd));
    (results).Set(Napi::String::New(env, "lowLatency"), Napi::Boolean::New(env, data->lowLatency));
    args.push_back(env.Null());
    args.push_back(results);
  }
  data->callback.Call(args);

  napi_delete_async_work(env, data->work);
  free(data);
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

  GetBaudRateBaton* baton = new GetBaudRateBaton();
  baton->fd = fd;
  baton->baudRate = 0;
  baton->callback.Reset(info[1].As<Napi::Function>());

  napi_value resource_name;
  napi_create_string_utf8(env, "GetBaudRate", NAPI_AUTO_LENGTH, &resource_name);
  napi_create_async_work(env, NULL, resource_name, EIO_GetBaudRate, EIO_AfterGetBaudRate, baton, &baton->work);
  napi_queue_async_work(env, baton->work);
  return env.Undefined();
}

void EIO_AfterGetBaudRate(napi_env n_env, napi_status status, void* req) {
  Napi::Env env = Napi::Env::Env(n_env);
  Napi::HandleScope scope(env);

  GetBaudRateBaton* data = (GetBaudRateBaton*)req;

  std::vector<napi_value> args;
  args.reserve(2);

  if (data->errorString[0]) {
    args.push_back(Napi::String::New(env, data->errorString));
    args.push_back(env.Undefined());
  } else {
    Napi::Object results = Napi::Object::New(env);
    (results).Set(Napi::String::New(env, "baudRate"), Napi::Number::New(env, data->baudRate));
    args.push_back(env.Null());
    args.push_back(results);
  }
  data->callback.Call(args);

  napi_delete_async_work(env, data->work);
  free(data);
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

  VoidBaton* baton = new VoidBaton();
  baton->fd = fd;
  baton->callback.Reset(info[1].As<Napi::Function>());

  napi_value resource_name;
  napi_create_string_utf8(env, "Drain", NAPI_AUTO_LENGTH, &resource_name);
  napi_create_async_work(env, NULL, resource_name, EIO_Drain, EIO_AfterDrain, baton, &baton->work);
  napi_queue_async_work(env, baton->work);
  return env.Undefined();
}

void EIO_AfterDrain(napi_env n_env, napi_status status, void* req) {
  Napi::Env env = Napi::Env::Env(n_env);
  Napi::HandleScope scope(env);

  VoidBaton* data = (VoidBaton*)req;

  std::vector<napi_value> args;
  args.reserve(1);

  if (data->errorString[0]) {
    args.push_back(Napi::String::New(env, data->errorString));
  } else {
    args.push_back(env.Null());
  }
  data->callback.Call(args);

  napi_delete_async_work(env, data->work);
  free(data);
}

SerialPortParity inline(ToParityEnum(const Napi::String& napistr)) {
  const char* str = napistr.Utf8Value().c_str();
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

SerialPortStopBits inline(ToStopBitEnum(double stopBits)) {
  if (stopBits > 1.4 && stopBits < 1.6) {
    return SERIALPORT_STOPBITS_ONE_FIVE;
  }
  if (stopBits == 2) {
    return SERIALPORT_STOPBITS_TWO;
  }
  return SERIALPORT_STOPBITS_ONE;
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
  exports.Set(Napi::String::New(env, "list"), Napi::Function::New(env, List));
  #endif

  #ifdef WIN32
  exports.Set("write", Napi::Function::New(env, Write));
  exports.Set("read", Napi::Function::New(env, Read));
  exports.Set("list", Napi::Function::New(env, List));
  #else
  Poller::Init(env, target, module);
  #endif
  return exports;
}

NODE_API_MODULE(serialport, init);
