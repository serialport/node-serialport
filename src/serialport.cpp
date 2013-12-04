

#include "serialport.h"
#include "queue.h"

#ifdef WIN32
#define strcasecmp stricmp
#else
#include "serialport_poller.h"
#endif

uv_mutex_t write_queue_mutex;
QUEUE write_queue;

NAN_METHOD(Open) {
  NanScope();

  uv_mutex_init(&write_queue_mutex);
  QUEUE_INIT(&write_queue);

  // path
  if(!args[0]->IsString()) {
    NanThrowTypeError("First argument must be a string");
    NanReturnUndefined();
  }
  v8::String::Utf8Value path(args[0]->ToString());

  // options
  if(!args[1]->IsObject()) {
    NanThrowTypeError("Second argument must be an object");
    NanReturnUndefined();
  }
  v8::Local<v8::Object> options = args[1]->ToObject();

  // callback
  if(!args[2]->IsFunction()) {
    NanThrowTypeError("Third argument must be a function");
    NanReturnUndefined();
  }
  v8::Local<v8::Function> callback = args[2].As<v8::Function>();

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

  baton->callback = new NanCallback(callback);
  baton->dataCallback = new NanCallback(options->Get(NanSymbol("dataCallback")).As<v8::Function>());
  baton->disconnectedCallback = new NanCallback(options->Get(NanSymbol("disconnectedCallback")).As<v8::Function>());
  baton->errorCallback = new NanCallback(options->Get(NanSymbol("errorCallback")).As<v8::Function>());

  uv_work_t* req = new uv_work_t();
  req->data = baton;

  uv_queue_work(uv_default_loop(), req, EIO_Open, (uv_after_work_cb)EIO_AfterOpen);

  NanReturnUndefined();
}

void EIO_AfterOpen(uv_work_t* req) {
  NanScope();

  OpenBaton* data = static_cast<OpenBaton*>(req->data);

  v8::Handle<v8::Value> argv[2];
  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(v8::String::New(data->errorString));
    argv[1] = v8::Undefined();
    // not needed for AfterOpenSuccess
    delete data->dataCallback;
    delete data->errorCallback;
    delete data->disconnectedCallback;
  } else {
    argv[0] = v8::Undefined();
    argv[1] = v8::Int32::New(data->result);
    AfterOpenSuccess(data->result, data->dataCallback, data->disconnectedCallback, data->errorCallback);
  }

  data->callback->Call(2, argv);

  delete data->callback;
  delete data;
  delete req;
}

NAN_METHOD(Write) {
  NanScope();

  // file descriptor
  if(!args[0]->IsInt32()) {
    NanThrowTypeError("First argument must be an int");
    NanReturnUndefined();
  }
  int fd = args[0]->ToInt32()->Int32Value();

  // buffer
  if(!args[1]->IsObject() || !node::Buffer::HasInstance(args[1])) {
    NanThrowTypeError("Second argument must be a buffer");
    NanReturnUndefined();
  }
  v8::Local<v8::Object> buffer = args[1]->ToObject();
  char* bufferData = node::Buffer::Data(buffer);
  size_t bufferLength = node::Buffer::Length(buffer);

  // callback
  if(!args[2]->IsFunction()) {
    NanThrowTypeError("Third argument must be a function");
    NanReturnUndefined();
  }
  v8::Local<v8::Function> callback = args[2].As<v8::Function>();

  WriteBaton* baton = new WriteBaton();
  memset(baton, 0, sizeof(WriteBaton));
  baton->fd = fd;
  NanAssignPersistent(v8::Object, baton->buffer, buffer);
  baton->bufferData = bufferData;
  baton->bufferLength = bufferLength;
  // baton->offset = 0;
  baton->callback = new NanCallback(callback);

  QueuedWrite* queuedWrite = new QueuedWrite();
  memset(queuedWrite, 0, sizeof(QueuedWrite));
  QUEUE_INIT(&queuedWrite->queue);
  queuedWrite->baton = baton;
  queuedWrite->req.data = queuedWrite;

  uv_mutex_lock(&write_queue_mutex);
  bool empty = QUEUE_EMPTY(&write_queue);

  QUEUE_INSERT_TAIL(&write_queue, &queuedWrite->queue);

  if (empty) {
    uv_queue_work(uv_default_loop(), &queuedWrite->req, EIO_Write, (uv_after_work_cb)EIO_AfterWrite);
  }
  uv_mutex_unlock(&write_queue_mutex);

  NanReturnUndefined();
}

void EIO_AfterWrite(uv_work_t* req) {
  NanScope();

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
  data->callback->Call(2, argv);

  if (data->offset < data->bufferLength) {
    // We're not done with this baton, so throw it right back onto the queue.
    // TODO: Add a uv_poll here for unix...
    uv_queue_work(uv_default_loop(), req, EIO_Write, (uv_after_work_cb)EIO_AfterWrite);
    return;
  }

  uv_mutex_lock(&write_queue_mutex);
  QUEUE_REMOVE(&queuedWrite->queue);

  if (!QUEUE_EMPTY(&write_queue)) {
    // Always pull the next work item from the head of the queue
    QUEUE* head = QUEUE_HEAD(&write_queue);
    QueuedWrite* nextQueuedWrite = QUEUE_DATA(head, QueuedWrite, queue);
    uv_queue_work(uv_default_loop(), &nextQueuedWrite->req, EIO_Write, (uv_after_work_cb)EIO_AfterWrite);
  }
  uv_mutex_unlock(&write_queue_mutex);

  NanDispose(data->buffer);
  delete data->callback;
  delete data;
  delete queuedWrite;
}

NAN_METHOD(Close) {
  NanScope();

  // file descriptor
  if(!args[0]->IsInt32()) {
    NanThrowTypeError("First argument must be an int");
    NanReturnUndefined();
  }
  int fd = args[0]->ToInt32()->Int32Value();

  // callback
  if(!args[1]->IsFunction()) {
    NanThrowTypeError("Second argument must be a function");
    NanReturnUndefined();
  }
  v8::Local<v8::Function> callback = args[1].As<v8::Function>();

  CloseBaton* baton = new CloseBaton();
  memset(baton, 0, sizeof(CloseBaton));
  baton->fd = fd;
  baton->callback = new NanCallback(callback);

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Close, (uv_after_work_cb)EIO_AfterClose);

  NanReturnUndefined();
}

void EIO_AfterClose(uv_work_t* req) {
  NanScope();

  CloseBaton* data = static_cast<CloseBaton*>(req->data);

  v8::Handle<v8::Value> argv[1];
  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(v8::String::New(data->errorString));
  } else {
    argv[0] = v8::Undefined();
  }
  data->callback->Call(1, argv);

  delete data->callback;
  delete data;
  delete req;
}

NAN_METHOD(List) {
  NanScope();

  // callback
  if(!args[0]->IsFunction()) {
    NanThrowTypeError("First argument must be a function");
    NanReturnUndefined();
  }
  v8::Local<v8::Function> callback = args[0].As<v8::Function>();

  ListBaton* baton = new ListBaton();
  strcpy(baton->errorString, "");
  baton->callback = new NanCallback(callback);

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_List, (uv_after_work_cb)EIO_AfterList);

  NanReturnUndefined();
}

void EIO_AfterList(uv_work_t* req) {
  NanScope();

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
  data->callback->Call(2, argv);

  delete data->callback;
  for(std::list<ListResultItem*>::iterator it = data->results.begin(); it != data->results.end(); ++it) {
    delete *it;
  }
  delete data;
  delete req;
}

NAN_METHOD(Flush) {
  NanScope();

  // file descriptor
  if(!args[0]->IsInt32()) {
    NanThrowTypeError("First argument must be an int");
    NanReturnUndefined();
  }
  int fd = args[0]->ToInt32()->Int32Value();

  // callback
  if(!args[1]->IsFunction()) {
    NanThrowTypeError("Second argument must be a function");
    NanReturnUndefined();
  }
  v8::Local<v8::Function> callback = args[1].As<v8::Function>();

  FlushBaton* baton = new FlushBaton();
  memset(baton, 0, sizeof(FlushBaton));
  baton->fd = fd;
  baton->callback = new NanCallback(callback);

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Flush, (uv_after_work_cb)EIO_AfterFlush);

  NanReturnUndefined();
}

void EIO_AfterFlush(uv_work_t* req) {
  NanScope();

  FlushBaton* data = static_cast<FlushBaton*>(req->data);

  v8::Handle<v8::Value> argv[2];

  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(v8::String::New(data->errorString));
    argv[1] = v8::Undefined();
  } else {
    argv[0] = v8::Undefined();
    argv[1] = v8::Int32::New(data->result);
  }
  data->callback->Call(2, argv);

  delete data->callback;
  delete data;
  delete req;
}

NAN_METHOD(Drain) {
  NanScope();

  // file descriptor
  if(!args[0]->IsInt32()) {
    NanThrowTypeError("First argument must be an int");
    NanReturnUndefined();
  }
  int fd = args[0]->ToInt32()->Int32Value();

  // callback
  if(!args[1]->IsFunction()) {
    NanThrowTypeError("Second argument must be a function");
    NanReturnUndefined();
  }
  v8::Local<v8::Function> callback = args[1].As<v8::Function>();

  DrainBaton* baton = new DrainBaton();
  memset(baton, 0, sizeof(DrainBaton));
  baton->fd = fd;
  baton->callback = new NanCallback(callback);

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Drain, (uv_after_work_cb)EIO_AfterDrain);

  NanReturnUndefined();
}

void EIO_AfterDrain(uv_work_t* req) {
  NanScope();

  DrainBaton* data = static_cast<DrainBaton*>(req->data);

  v8::Handle<v8::Value> argv[2];

  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(v8::String::New(data->errorString));
    argv[1] = v8::Undefined();
  } else {
    argv[0] = v8::Undefined();
    argv[1] = v8::Int32::New(data->result);
  }
  data->callback->Call(2, argv);

  delete data->callback;
  delete data;
  delete req;
}

SerialPortParity NAN_INLINE(ToParityEnum(const v8::Handle<v8::String>& v8str)) {
  NanScope();

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

SerialPortStopBits NAN_INLINE(ToStopBitEnum(double stopBits)) {
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
    NanScope();
    NODE_SET_METHOD(target, "open", Open);
    NODE_SET_METHOD(target, "write", Write);
    NODE_SET_METHOD(target, "close", Close);
    NODE_SET_METHOD(target, "list", List);
    NODE_SET_METHOD(target, "flush", Flush);
    NODE_SET_METHOD(target, "drain", Drain);

#ifndef WIN32
    SerialportPoller::Init(target);
#endif
  }
}

NODE_MODULE(serialport, init);
