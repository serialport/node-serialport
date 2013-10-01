

#include "serialport.h"

#ifdef WIN32
#define strcasecmp stricmp
#else
#include "serialport_poller.h"
#endif

uv_mutex_t write_queue_mutex;
ngx_queue_t write_queue;

v8::Handle<v8::Value> Open(const v8::Arguments& args) {
  v8::HandleScope scope;

  uv_mutex_init(&write_queue_mutex);
  ngx_queue_init(&write_queue);

  // path
  if(!args[0]->IsString()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("First argument must be a string"))));
  }
  v8::String::Utf8Value path(args[0]->ToString());

  // options
  if(!args[1]->IsObject()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("Second argument must be an object"))));
  }
  v8::Local<v8::Object> options = args[1]->ToObject();

  // callback
  if(!args[2]->IsFunction()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("Third argument must be a function"))));
  }
  v8::Local<v8::Value> callback = args[2];

  OpenBaton* baton = new OpenBaton();
  memset(baton, 0, sizeof(OpenBaton));
  strcpy(baton->path, *path);
  baton->baudRate = options->Get(v8::String::New("baudRate"))->ToInt32()->Int32Value();
  baton->dataBits = options->Get(v8::String::New("dataBits"))->ToInt32()->Int32Value();
  baton->bufferSize = options->Get(v8::String::New("bufferSize"))->ToInt32()->Int32Value();
  baton->parity = ToParityEnum(options->Get(v8::String::New("parity"))->ToString());
  baton->stopBits = ToStopBitEnum(options->Get(v8::String::New("stopBits"))->ToNumber()->NumberValue());
  baton->rtscts = options->Get(v8::String::New("rtscts"))->ToBoolean()->BooleanValue();
  baton->xon = options->Get(v8::String::New("xon"))->ToBoolean()->BooleanValue();
  baton->xoff = options->Get(v8::String::New("xoff"))->ToBoolean()->BooleanValue();
  baton->xany = options->Get(v8::String::New("xany"))->ToBoolean()->BooleanValue();


  baton->callback = v8::Persistent<v8::Value>::New(callback);
  baton->dataCallback = v8::Persistent<v8::Value>::New(options->Get(v8::String::New("dataCallback")));
  baton->disconnectedCallback = v8::Persistent<v8::Value>::New(options->Get(v8::String::New("disconnectedCallback")));
  baton->errorCallback = v8::Persistent<v8::Value>::New(options->Get(v8::String::New("errorCallback")));

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Open, (uv_after_work_cb)EIO_AfterOpen);

  return scope.Close(v8::Undefined());
}

void EIO_AfterOpen(uv_work_t* req) {
  OpenBaton* data = static_cast<OpenBaton*>(req->data);

  v8::Handle<v8::Value> argv[2];
  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(v8::String::New(data->errorString));
    argv[1] = v8::Undefined();
  } else {
    argv[0] = v8::Undefined();
    argv[1] = v8::Int32::New(data->result);
    AfterOpenSuccess(data->result, data->dataCallback, data->disconnectedCallback, data->errorCallback);
  }
  v8::Function::Cast(*data->callback)->Call(v8::Context::GetCurrent()->Global(), 2, argv);

  data->callback.Dispose();
  delete data;
  delete req;
}

v8::Handle<v8::Value> Write(const v8::Arguments& args) {
  v8::HandleScope scope;

  // file descriptor
  if(!args[0]->IsInt32()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("First argument must be an int"))));
  }
  int fd = args[0]->ToInt32()->Int32Value();

  // buffer
  if(!args[1]->IsObject() || !node::Buffer::HasInstance(args[1])) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("Second argument must be a buffer"))));
  }
  v8::Persistent<v8::Object> buffer = v8::Persistent<v8::Object>::New(args[1]->ToObject());
  char* bufferData = node::Buffer::Data(buffer);
  size_t bufferLength = node::Buffer::Length(buffer);

  // callback
  if(!args[2]->IsFunction()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("Third argument must be a function"))));
  }
  v8::Local<v8::Value> callback = args[2];

  WriteBaton* baton = new WriteBaton();
  memset(baton, 0, sizeof(WriteBaton));
  baton->fd = fd;
  baton->buffer = buffer;
  baton->bufferData = bufferData;
  baton->bufferLength = bufferLength;
  // baton->offset = 0;
  baton->callback = v8::Persistent<v8::Value>::New(callback);

  QueuedWrite* queuedWrite = new QueuedWrite();
  memset(queuedWrite, 0, sizeof(QueuedWrite));
  ngx_queue_init(&queuedWrite->queue);
  queuedWrite->baton = baton;
  queuedWrite->req.data = queuedWrite;

  uv_mutex_lock(&write_queue_mutex);
  bool empty = ngx_queue_empty(&write_queue);

  ngx_queue_insert_tail(&write_queue, &queuedWrite->queue);

  if (empty) {
    uv_queue_work(uv_default_loop(), &queuedWrite->req, EIO_Write, (uv_after_work_cb)EIO_AfterWrite);
  }   
  uv_mutex_unlock(&write_queue_mutex);

  return scope.Close(v8::Undefined());
}

void EIO_AfterWrite(uv_work_t* req) {
  QueuedWrite* queuedWrite = static_cast<QueuedWrite*>(req->data);
  WriteBaton* data = static_cast<WriteBaton*>(queuedWrite->baton);

  v8::Handle<v8::Value> argv[2];
  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(v8::String::New(data->errorString));
    argv[1] = v8::Undefined();
  } else {
    argv[0] = v8::Undefined();
    argv[1] = v8::Int32::New(data->result);
  }
  v8::Function::Cast(*data->callback)->Call(v8::Context::GetCurrent()->Global(), 2, argv);

  if (data->offset < data->bufferLength) {
    // We're not done with this baton, so throw it right back onto the queue.
    // TODO: Add a uv_poll here for unix...
    uv_queue_work(uv_default_loop(), req, EIO_Write, (uv_after_work_cb)EIO_AfterWrite);
    return;
  }

  uv_mutex_lock(&write_queue_mutex);
  ngx_queue_remove(&queuedWrite->queue);

  if (!ngx_queue_empty(&write_queue)) {
    // Always pull the next work item from the head of the queue
    ngx_queue_t* head = ngx_queue_head(&write_queue);
    QueuedWrite* nextQueuedWrite = ngx_queue_data(head, QueuedWrite, queue);
    uv_queue_work(uv_default_loop(), &nextQueuedWrite->req, EIO_Write, (uv_after_work_cb)EIO_AfterWrite);
  }
  uv_mutex_unlock(&write_queue_mutex);

  data->buffer.Dispose();
  data->callback.Dispose();
  delete data;
  delete queuedWrite;
}

v8::Handle<v8::Value> Close(const v8::Arguments& args) {
  v8::HandleScope scope;

  // file descriptor
  if(!args[0]->IsInt32()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("First argument must be an int"))));
  }
  int fd = args[0]->ToInt32()->Int32Value();

  // callback
  if(!args[1]->IsFunction()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("Second argument must be a function"))));
  }
  v8::Local<v8::Value> callback = args[1];

  CloseBaton* baton = new CloseBaton();
  memset(baton, 0, sizeof(CloseBaton));
  baton->fd = fd;
  baton->callback = v8::Persistent<v8::Value>::New(callback);

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Close, (uv_after_work_cb)EIO_AfterClose);

  return scope.Close(v8::Undefined());
}

void EIO_AfterClose(uv_work_t* req) {
  CloseBaton* data = static_cast<CloseBaton*>(req->data);

  v8::Handle<v8::Value> argv[1];
  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(v8::String::New(data->errorString));
  } else {
    argv[0] = v8::Undefined();
  }
  v8::Function::Cast(*data->callback)->Call(v8::Context::GetCurrent()->Global(), 1, argv);

  data->callback.Dispose();
  delete data;
  delete req;
}

v8::Handle<v8::Value> List(const v8::Arguments& args) {
  v8::HandleScope scope;

  // callback
  if(!args[0]->IsFunction()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("First argument must be a function"))));
  }
  v8::Local<v8::Value> callback = args[0];

  ListBaton* baton = new ListBaton();
  strcpy(baton->errorString, "");
  baton->callback = v8::Persistent<v8::Value>::New(callback);

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_List, (uv_after_work_cb)EIO_AfterList);

  return scope.Close(v8::Undefined());
}

void EIO_AfterList(uv_work_t* req) {
  ListBaton* data = static_cast<ListBaton*>(req->data);

  v8::Handle<v8::Value> argv[2];
  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(v8::String::New(data->errorString));
    argv[1] = v8::Undefined();
  } else {
    v8::Local<v8::Array> results = v8::Array::New();
    int i = 0;
    for(std::list<ListResultItem*>::iterator it = data->results.begin(); it != data->results.end(); ++it, i++) {
      v8::Local<v8::Object> item = v8::Object::New();
      item->Set(v8::String::New("comName"), v8::String::New((*it)->comName.c_str()));
      item->Set(v8::String::New("manufacturer"), v8::String::New((*it)->manufacturer.c_str()));
      item->Set(v8::String::New("serialNumber"), v8::String::New((*it)->serialNumber.c_str()));
      item->Set(v8::String::New("pnpId"), v8::String::New((*it)->pnpId.c_str()));
      item->Set(v8::String::New("locationId"), v8::String::New((*it)->locationId.c_str()));
      item->Set(v8::String::New("vendorId"), v8::String::New((*it)->vendorId.c_str()));
      item->Set(v8::String::New("productId"), v8::String::New((*it)->productId.c_str()));
      results->Set(i, item);
    }
    argv[0] = v8::Undefined();
    argv[1] = results;
  }
  v8::Function::Cast(*data->callback)->Call(v8::Context::GetCurrent()->Global(), 2, argv);

  data->callback.Dispose();
  for(std::list<ListResultItem*>::iterator it = data->results.begin(); it != data->results.end(); ++it) {
    delete *it;
  }
  delete data;
  delete req;
}

v8::Handle<v8::Value> Flush(const v8::Arguments& args) {
  v8::HandleScope scope;

  // file descriptor
  if(!args[0]->IsInt32()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("First argument must be an int"))));
  }
  int fd = args[0]->ToInt32()->Int32Value();

  // callback
  if(!args[1]->IsFunction()) {
    return scope.Close(v8::ThrowException(v8::Exception::TypeError(v8::String::New("Second argument must be a function"))));
  }
  v8::Local<v8::Value> callback = args[1];

  FlushBaton* baton = new FlushBaton();
  memset(baton, 0, sizeof(FlushBaton));
  baton->fd = fd;
  baton->callback = v8::Persistent<v8::Value>::New(callback);

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Flush, (uv_after_work_cb)EIO_AfterFlush);

  return scope.Close(v8::Undefined());
}

void EIO_AfterFlush(uv_work_t* req) {
  FlushBaton* data = static_cast<FlushBaton*>(req->data);

  v8::Handle<v8::Value> argv[2];

  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(v8::String::New(data->errorString));
    argv[1] = v8::Undefined();
  } else {
    argv[0] = v8::Undefined();
    argv[1] = v8::Int32::New(data->result);
  }
  v8::Function::Cast(*data->callback)->Call(v8::Context::GetCurrent()->Global(), 2, argv);

  data->callback.Dispose();
  delete data;
  delete req;
}

SerialPortParity ToParityEnum(const v8::Handle<v8::String>& v8str) {
  v8::String::AsciiValue str(v8str);
  if(!strcasecmp(*str, "none")) {
    return SERIALPORT_PARITY_NONE;
  }
  if(!strcasecmp(*str, "even")) {
    return SERIALPORT_PARITY_EVEN;
  }
  if(!strcasecmp(*str, "mark")) {
    return SERIALPORT_PARITY_MARK;
  }
  if(!strcasecmp(*str, "odd")) {
    return SERIALPORT_PARITY_ODD;
  }
  if(!strcasecmp(*str, "space")) {
    return SERIALPORT_PARITY_SPACE;
  }
  return SERIALPORT_PARITY_NONE;
}

SerialPortStopBits ToStopBitEnum(double stopBits) {
  if(stopBits > 1.4 && stopBits < 1.6) {
    return SERIALPORT_STOPBITS_ONE_FIVE;
  }
  if(stopBits == 2) {
    return SERIALPORT_STOPBITS_TWO;
  }
  return SERIALPORT_STOPBITS_ONE;
}

extern "C" {
  void init (v8::Handle<v8::Object> target) 
  {
    v8::HandleScope scope;
    NODE_SET_METHOD(target, "open", Open);
    NODE_SET_METHOD(target, "write", Write);
    NODE_SET_METHOD(target, "close", Close);
    NODE_SET_METHOD(target, "list", List);
    NODE_SET_METHOD(target, "flush", Flush);

#ifndef WIN32
    SerialportPoller::Init(target);
#endif
  }
}

NODE_MODULE(serialport, init);
