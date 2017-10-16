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

v8::Local<v8::Value> getValueFromObject(v8::Local<v8::Object> options, std::string key) {
  v8::Local<v8::String> v8str = Nan::New<v8::String>(key).ToLocalChecked();
  return Nan::Get(options, v8str).ToLocalChecked();
}

int getIntFromObject(v8::Local<v8::Object> options, std::string key) {
  return Nan::To<v8::Int32>(getValueFromObject(options, key)).ToLocalChecked()->Value();
}

bool getBoolFromObject(v8::Local<v8::Object> options, std::string key) {
  return Nan::To<v8::Boolean>(getValueFromObject(options, key)).ToLocalChecked()->Value();
}

v8::Local<v8::String> getStringFromObj(v8::Local<v8::Object> options, std::string key) {
  return Nan::To<v8::String>(getValueFromObject(options, key)).ToLocalChecked();
}

double getDoubleFromObject(v8::Local<v8::Object> options, std::string key) {
  return Nan::To<double>(getValueFromObject(options, key)).FromMaybe(0);
}

NAN_METHOD(Open) {
  // path
  if (!info[0]->IsString()) {
    Nan::ThrowTypeError("First argument must be a string");
    return;
  }
  v8::String::Utf8Value path(info[0]->ToString());

  // options
  if (!info[1]->IsObject()) {
    Nan::ThrowTypeError("Second argument must be an object");
    return;
  }
  v8::Local<v8::Object> options = info[1]->ToObject();

  // callback
  if (!info[2]->IsFunction()) {
    Nan::ThrowTypeError("Third argument must be a function");
    return;
  }

  OpenBaton* baton = new OpenBaton();
  strcpy(baton->path, *path);
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
  baton->callback.Reset(info[2].As<v8::Function>());

  #ifndef WIN32
    baton->vmin = getIntFromObject(options, "vmin");
    baton->vtime = getIntFromObject(options, "vtime");
  #endif

  uv_work_t* req = new uv_work_t();
  req->data = baton;

  uv_queue_work(uv_default_loop(), req, EIO_Open, (uv_after_work_cb)EIO_AfterOpen);
}

void EIO_AfterOpen(uv_work_t* req) {
  Nan::HandleScope scope;

  OpenBaton* data = static_cast<OpenBaton*>(req->data);

  v8::Local<v8::Value> argv[2];
  if (data->errorString[0]) {
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(data->errorString).ToLocalChecked());
    argv[1] = Nan::Undefined();
  } else {
    argv[0] = Nan::Null();
    argv[1] = Nan::New<v8::Int32>(data->result);
  }

  data->callback.Call(2, argv);
  delete data;
  delete req;
}

NAN_METHOD(Update) {
  // file descriptor
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("First argument must be an int");
    return;
  }
  int fd = Nan::To<int>(info[0]).FromJust();

  // options
  if (!info[1]->IsObject()) {
    Nan::ThrowTypeError("Second argument must be an object");
    return;
  }
  v8::Local<v8::Object> options = info[1]->ToObject();

  if (!Nan::Has(options, Nan::New<v8::String>("baudRate").ToLocalChecked()).FromMaybe(false)) {
    Nan::ThrowTypeError("\"baudRate\" must be set on options object");
    return;
  }

  // callback
  if (!info[2]->IsFunction()) {
    Nan::ThrowTypeError("Third argument must be a function");
    return;
  }

  ConnectionOptionsBaton* baton = new ConnectionOptionsBaton();

  baton->fd = fd;
  baton->baudRate = getIntFromObject(options, "baudRate");
  baton->callback.Reset(info[2].As<v8::Function>());

  uv_work_t* req = new uv_work_t();
  req->data = baton;

  uv_queue_work(uv_default_loop(), req, EIO_Update, (uv_after_work_cb)EIO_AfterUpdate);
}

void EIO_AfterUpdate(uv_work_t* req) {
  Nan::HandleScope scope;

  ConnectionOptionsBaton* data = static_cast<ConnectionOptionsBaton*>(req->data);

  v8::Local<v8::Value> argv[1];
  if (data->errorString[0]) {
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(data->errorString).ToLocalChecked());
  } else {
    argv[0] = Nan::Null();
  }

  data->callback.Call(1, argv);

  delete data;
  delete req;
}

NAN_METHOD(Close) {
  // file descriptor
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("First argument must be an int");
    return;
  }

  // callback
  if (!info[1]->IsFunction()) {
    Nan::ThrowTypeError("Second argument must be a function");
    return;
  }

  VoidBaton* baton = new VoidBaton();
  baton->fd = Nan::To<v8::Int32>(info[0]).ToLocalChecked()->Value();
  baton->callback.Reset(info[1].As<v8::Function>());

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Close, (uv_after_work_cb)EIO_AfterClose);
}

void EIO_AfterClose(uv_work_t* req) {
  Nan::HandleScope scope;
  VoidBaton* data = static_cast<VoidBaton*>(req->data);

  v8::Local<v8::Value> argv[1];
  if (data->errorString[0]) {
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(data->errorString).ToLocalChecked());
  } else {
    argv[0] = Nan::Null();
  }
  data->callback.Call(1, argv);

  delete data;
  delete req;
}

NAN_METHOD(Flush) {
  // file descriptor
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("First argument must be an int");
    return;
  }
  int fd = Nan::To<int>(info[0]).FromJust();

  // callback
  if (!info[1]->IsFunction()) {
    Nan::ThrowTypeError("Second argument must be a function");
    return;
  }
  v8::Local<v8::Function> callback = info[1].As<v8::Function>();

  VoidBaton* baton = new VoidBaton();
  baton->fd = fd;
  baton->callback.Reset(callback);

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Flush, (uv_after_work_cb)EIO_AfterFlush);
}

void EIO_AfterFlush(uv_work_t* req) {
  Nan::HandleScope scope;

  VoidBaton* data = static_cast<VoidBaton*>(req->data);

  v8::Local<v8::Value> argv[1];

  if (data->errorString[0]) {
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(data->errorString).ToLocalChecked());
  } else {
    argv[0] = Nan::Null();
  }

  data->callback.Call(1, argv);

  delete data;
  delete req;
}

NAN_METHOD(Set) {
  // file descriptor
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("First argument must be an int");
    return;
  }
  int fd = Nan::To<int>(info[0]).FromJust();

  // options
  if (!info[1]->IsObject()) {
    Nan::ThrowTypeError("Second argument must be an object");
    return;
  }
  v8::Local<v8::Object> options = info[1]->ToObject();

  // callback
  if (!info[2]->IsFunction()) {
    Nan::ThrowTypeError("Third argument must be a function");
    return;
  }
  v8::Local<v8::Function> callback = info[2].As<v8::Function>();

  SetBaton* baton = new SetBaton();
  baton->fd = fd;
  baton->callback.Reset(callback);
  baton->brk = getBoolFromObject(options, "brk");
  baton->rts = getBoolFromObject(options, "rts");
  baton->cts = getBoolFromObject(options, "cts");
  baton->dtr = getBoolFromObject(options, "dtr");
  baton->dsr = getBoolFromObject(options, "dsr");

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Set, (uv_after_work_cb)EIO_AfterSet);
}

void EIO_AfterSet(uv_work_t* req) {
  Nan::HandleScope scope;

  SetBaton* data = static_cast<SetBaton*>(req->data);

  v8::Local<v8::Value> argv[1];

  if (data->errorString[0]) {
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(data->errorString).ToLocalChecked());
  } else {
    argv[0] = Nan::Null();
  }
  data->callback.Call(1, argv);

  delete data;
  delete req;
}

NAN_METHOD(Get) {
  // file descriptor
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("First argument must be an int");
    return;
  }
  int fd = Nan::To<int>(info[0]).FromJust();

  // callback
  if (!info[1]->IsFunction()) {
    Nan::ThrowTypeError("Second argument must be a function");
    return;
  }

  GetBaton* baton = new GetBaton();
  baton->fd = fd;
  baton->cts = false;
  baton->dsr = false;
  baton->dcd = false;
  baton->callback.Reset(info[1].As<v8::Function>());

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Get, (uv_after_work_cb)EIO_AfterGet);
}

void EIO_AfterGet(uv_work_t* req) {
  Nan::HandleScope scope;

  GetBaton* data = static_cast<GetBaton*>(req->data);

  v8::Local<v8::Value> argv[2];

  if (data->errorString[0]) {
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(data->errorString).ToLocalChecked());
    argv[1] = Nan::Undefined();
  } else {
    v8::Local<v8::Object> results = Nan::New<v8::Object>();
    results->Set(Nan::New<v8::String>("cts").ToLocalChecked(), Nan::New<v8::Boolean>(data->cts));
    results->Set(Nan::New<v8::String>("dsr").ToLocalChecked(), Nan::New<v8::Boolean>(data->dsr));
    results->Set(Nan::New<v8::String>("dcd").ToLocalChecked(), Nan::New<v8::Boolean>(data->dcd));

    argv[0] = Nan::Null();
    argv[1] = results;
  }
  data->callback.Call(2, argv);

  delete data;
  delete req;
}

NAN_METHOD(Drain) {
  // file descriptor
  if (!info[0]->IsInt32()) {
    Nan::ThrowTypeError("First argument must be an int");
    return;
  }
  int fd = Nan::To<int>(info[0]).FromJust();

  // callback
  if (!info[1]->IsFunction()) {
    Nan::ThrowTypeError("Second argument must be a function");
    return;
  }

  VoidBaton* baton = new VoidBaton();
  baton->fd = fd;
  baton->callback.Reset(info[1].As<v8::Function>());

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Drain, (uv_after_work_cb)EIO_AfterDrain);
}

void EIO_AfterDrain(uv_work_t* req) {
  Nan::HandleScope scope;

  VoidBaton* data = static_cast<VoidBaton*>(req->data);

  v8::Local<v8::Value> argv[1];

  if (data->errorString[0]) {
    argv[0] = v8::Exception::Error(Nan::New<v8::String>(data->errorString).ToLocalChecked());
  } else {
    argv[0] = Nan::Null();
  }
  data->callback.Call(1, argv);

  delete data;
  delete req;
}

SerialPortParity NAN_INLINE(ToParityEnum(const v8::Local<v8::String>& v8str)) {
  Nan::HandleScope scope;
  Nan::Utf8String str(v8str);
  size_t count = strlen(*str);
  SerialPortParity parity = SERIALPORT_PARITY_NONE;
  if (!strncasecmp(*str, "none", count)) {
    parity = SERIALPORT_PARITY_NONE;
  } else if (!strncasecmp(*str, "even", count)) {
    parity = SERIALPORT_PARITY_EVEN;
  } else if (!strncasecmp(*str, "mark", count)) {
    parity = SERIALPORT_PARITY_MARK;
  } else if (!strncasecmp(*str, "odd", count)) {
    parity = SERIALPORT_PARITY_ODD;
  } else if (!strncasecmp(*str, "space", count)) {
    parity = SERIALPORT_PARITY_SPACE;
  }
  return parity;
}

SerialPortStopBits NAN_INLINE(ToStopBitEnum(double stopBits)) {
  if (stopBits > 1.4 && stopBits < 1.6) {
    return SERIALPORT_STOPBITS_ONE_FIVE;
  }
  if (stopBits == 2) {
    return SERIALPORT_STOPBITS_TWO;
  }
  return SERIALPORT_STOPBITS_ONE;
}

extern "C" {
  void init(v8::Handle<v8::Object> target) {
    Nan::HandleScope scope;
    Nan::SetMethod(target, "set", Set);
    Nan::SetMethod(target, "get", Get);
    Nan::SetMethod(target, "open", Open);
    Nan::SetMethod(target, "update", Update);
    Nan::SetMethod(target, "close", Close);
    Nan::SetMethod(target, "flush", Flush);
    Nan::SetMethod(target, "drain", Drain);

    #ifdef __APPLE__
    Nan::SetMethod(target, "list", List);
    #endif

    #ifdef WIN32
    Nan::SetMethod(target, "write", Write);
    Nan::SetMethod(target, "read", Read);
    Nan::SetMethod(target, "list", List);
    #else
    Poller::Init(target);
    #endif
  }
}

NODE_MODULE(serialport, init);
