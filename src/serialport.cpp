

#include "serialport.h"

#ifdef WIN32
#define strncasecmp strnicmp
#else
#include "serialport_poller.h"
#endif

struct _WriteQueue {
  const int _fd; // the fd that is associated with this write queue
  QueuedWrite _write_queue;
  uv_mutex_t _write_queue_mutex;
  _WriteQueue *_next;

  _WriteQueue(const int fd) : _fd(fd), _write_queue(), _next(NULL) {
    uv_mutex_init(&_write_queue_mutex);
  }

  void lock() { uv_mutex_lock(&_write_queue_mutex); };
  void unlock() { uv_mutex_unlock(&_write_queue_mutex); };

  QueuedWrite &get() { return _write_queue; }
};


static _WriteQueue *write_queues = NULL;

static _WriteQueue *qForFD(const int fd) {
  _WriteQueue *q = write_queues;
  while (q != NULL) {
    if (q->_fd == fd) {
      return q;
    }
    q = q->_next;
  }
  return NULL;
};

static _WriteQueue *newQForFD(const int fd) {
  _WriteQueue *q = qForFD(fd);

  if (q == NULL) {
    if (write_queues == NULL) {
      write_queues = new _WriteQueue(fd);
      return write_queues;
    } else {
      q = write_queues;
      while (q->_next != NULL) {
        q = q->_next;
      }
      q->_next = new _WriteQueue(fd);
      return q->_next;
    }
  }

  return q;
};

static void deleteQForFD(const int fd) {
  if (write_queues == NULL)
    return;

  _WriteQueue *q = write_queues;
  if (write_queues->_fd == fd) {
    write_queues = write_queues->_next;
    delete q;

    return;
  }

  while (q->_next != NULL) {
    if (q->_next->_fd == fd) {
      _WriteQueue *out_q = q->_next;
      q->_next = q->_next->_next;
      delete out_q;

      return;
    }
    q = q->_next;
  }

  // It wasn't found...
};



NAN_METHOD(Open) {
  NanScope();

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
  baton->baudRate = options->Get(NanNew<v8::String>("baudRate"))->ToInt32()->Int32Value();
  baton->dataBits = options->Get(NanNew<v8::String>("dataBits"))->ToInt32()->Int32Value();
  baton->bufferSize = options->Get(NanNew<v8::String>("bufferSize"))->ToInt32()->Int32Value();
  baton->parity = ToParityEnum(options->Get(NanNew<v8::String>("parity"))->ToString());
  baton->stopBits = ToStopBitEnum(options->Get(NanNew<v8::String>("stopBits"))->ToNumber()->NumberValue());
  baton->rtscts = options->Get(NanNew<v8::String>("rtscts"))->ToBoolean()->BooleanValue();
  baton->xon = options->Get(NanNew<v8::String>("xon"))->ToBoolean()->BooleanValue();
  baton->xoff = options->Get(NanNew<v8::String>("xoff"))->ToBoolean()->BooleanValue();
  baton->xany = options->Get(NanNew<v8::String>("xany"))->ToBoolean()->BooleanValue();
  baton->hupcl = options->Get(NanNew<v8::String>("hupcl"))->ToBoolean()->BooleanValue();

  v8::Local<v8::Object> platformOptions = options->Get(NanNew<v8::String>("platformOptions"))->ToObject();
  baton->platformOptions = ParsePlatformOptions(platformOptions);

  baton->callback = new NanCallback(callback);
  baton->dataCallback = new NanCallback(options->Get(NanNew<v8::String>("dataCallback")).As<v8::Function>());
  baton->disconnectedCallback = new NanCallback(options->Get(NanNew<v8::String>("disconnectedCallback")).As<v8::Function>());
  baton->errorCallback = new NanCallback(options->Get(NanNew<v8::String>("errorCallback")).As<v8::Function>());

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
    argv[0] = v8::Exception::Error(NanNew<v8::String>(data->errorString));
    argv[1] = NanUndefined();
    // not needed for AfterOpenSuccess
    delete data->dataCallback;
    delete data->errorCallback;
    delete data->disconnectedCallback;
  } else {
    argv[0] = NanUndefined();
    argv[1] = NanNew<v8::Int32>(data->result);

    int fd = argv[1]->ToInt32()->Int32Value();
    newQForFD(fd);

    AfterOpenSuccess(data->result, data->dataCallback, data->disconnectedCallback, data->errorCallback);
  }

  data->callback->Call(2, argv);

  delete data->platformOptions;
  delete data->callback;
  delete data;
  delete req;
}

NAN_METHOD(Update) {
  NanScope();
  
  // file descriptor
  if(!args[0]->IsInt32()) {
    NanThrowTypeError("First argument must be an int");
    NanReturnUndefined();
  }
  int fd = args[0]->ToInt32()->Int32Value();

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
  baton->fd = fd;
  baton->baudRate = options->Get(NanNew<v8::String>("baudRate"))->ToInt32()->Int32Value();
  baton->dataBits = options->Get(NanNew<v8::String>("dataBits"))->ToInt32()->Int32Value();
  baton->bufferSize = options->Get(NanNew<v8::String>("bufferSize"))->ToInt32()->Int32Value();
  baton->parity = ToParityEnum(options->Get(NanNew<v8::String>("parity"))->ToString());
  baton->stopBits = ToStopBitEnum(options->Get(NanNew<v8::String>("stopBits"))->ToNumber()->NumberValue());
  baton->rtscts = options->Get(NanNew<v8::String>("rtscts"))->ToBoolean()->BooleanValue();
  baton->xon = options->Get(NanNew<v8::String>("xon"))->ToBoolean()->BooleanValue();
  baton->xoff = options->Get(NanNew<v8::String>("xoff"))->ToBoolean()->BooleanValue();
  baton->xany = options->Get(NanNew<v8::String>("xany"))->ToBoolean()->BooleanValue();

  v8::Local<v8::Object> platformOptions = options->Get(NanNew<v8::String>("platformOptions"))->ToObject();
  baton->platformOptions = ParsePlatformOptions(platformOptions);

  baton->callback = new NanCallback(callback);
  baton->dataCallback = new NanCallback(options->Get(NanNew<v8::String>("dataCallback")).As<v8::Function>());
  baton->disconnectedCallback = new NanCallback(options->Get(NanNew<v8::String>("disconnectedCallback")).As<v8::Function>());
  baton->errorCallback = new NanCallback(options->Get(NanNew<v8::String>("errorCallback")).As<v8::Function>());

  uv_work_t* req = new uv_work_t();
  req->data = baton;

  uv_queue_work(uv_default_loop(), req, EIO_Update, (uv_after_work_cb)EIO_AfterUpdate);

  NanReturnUndefined();
}

void EIO_AfterUpdate(uv_work_t* req) {
  NanScope();

  OpenBaton* data = static_cast<OpenBaton*>(req->data);

  v8::Handle<v8::Value> argv[2];
  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(NanNew<v8::String>(data->errorString));
    argv[1] = NanUndefined();
    // not needed for AfterOpenSuccess
    delete data->dataCallback;
    delete data->errorCallback;
    delete data->disconnectedCallback;
  } else {
    argv[0] = NanUndefined();
    argv[1] = NanNew<v8::Int32>(data->result);

    int fd = argv[1]->ToInt32()->Int32Value();
    newQForFD(fd);

    AfterOpenSuccess(data->result, data->dataCallback, data->disconnectedCallback, data->errorCallback);
  }

  data->callback->Call(2, argv);

  delete data->platformOptions;
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
  NanAssignPersistent<v8::Object>(baton->buffer, buffer);
  baton->bufferData = bufferData;
  baton->bufferLength = bufferLength;
  baton->offset = 0;
  baton->callback = new NanCallback(callback);

  QueuedWrite* queuedWrite = new QueuedWrite();
  memset(queuedWrite, 0, sizeof(QueuedWrite));
  queuedWrite->baton = baton;
  queuedWrite->req.data = queuedWrite;

  _WriteQueue *q = qForFD(fd);
  if(!q) {
    NanThrowTypeError("There's no write queue for that file descriptor (write)!");
    NanReturnUndefined();
  }

  q->lock();
  QueuedWrite &write_queue = q->get();
  bool empty = write_queue.empty();

  write_queue.insert_tail(queuedWrite);

  if (empty) {
    uv_queue_work(uv_default_loop(), &queuedWrite->req, EIO_Write, (uv_after_work_cb)EIO_AfterWrite);
  }
  q->unlock();

  NanReturnUndefined();
}

void EIO_AfterWrite(uv_work_t* req) {
  NanScope();

  QueuedWrite* queuedWrite = static_cast<QueuedWrite*>(req->data);
  WriteBaton* data = static_cast<WriteBaton*>(queuedWrite->baton);

  v8::Handle<v8::Value> argv[2];
  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(NanNew<v8::String>(data->errorString));
    argv[1] = NanUndefined();
  } else {
    argv[0] = NanUndefined();
    argv[1] = NanNew<v8::Int32>(data->result);
  }
  data->callback->Call(2, argv);

  if (data->offset < data->bufferLength && !data->errorString[0]) {
    // We're not done with this baton, so throw it right back onto the queue.
	  // Don't re-push the write in the event loop if there was an error; because same error could occur again!
    // TODO: Add a uv_poll here for unix...
    //fprintf(stderr, "Write again...\n");
    uv_queue_work(uv_default_loop(), req, EIO_Write, (uv_after_work_cb)EIO_AfterWrite);
    return;
  }

  int fd = data->fd;
  _WriteQueue *q = qForFD(fd);
  if(!q) {
    NanThrowTypeError("There's no write queue for that file descriptor (after write)!");
    return;
  }

  q->lock();
  QueuedWrite &write_queue = q->get();

  // remove this one from the list
  queuedWrite->remove();

  // If there are any left, start a new thread to write the next one.
  if (!write_queue.empty()) {
    // Always pull the next work item from the head of the queue
    QueuedWrite* nextQueuedWrite = write_queue.next;
    uv_queue_work(uv_default_loop(), &nextQueuedWrite->req, EIO_Write, (uv_after_work_cb)EIO_AfterWrite);
  }
  q->unlock();

  NanDisposePersistent(data->buffer);
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
    argv[0] = v8::Exception::Error(NanNew<v8::String>(data->errorString));
  } else {
    argv[0] = NanUndefined();

    // We don't have an error, so clean up the write queue for that fd

    _WriteQueue *q = qForFD(data->fd);
    if (q) {
      q->lock();
      QueuedWrite &write_queue = q->get();
      while (!write_queue.empty()) {
        QueuedWrite *del_q = write_queue.next;
        NanDisposePersistent(del_q->baton->buffer);
        del_q->remove();
      }
      q->unlock();

      deleteQForFD(data->fd);
    }

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
    argv[0] = v8::Exception::Error(NanNew<v8::String>(data->errorString));
    argv[1] = NanUndefined();
  } else {
    v8::Local<v8::Array> results = NanNew<v8::Array>();
    int i = 0;
    for(std::list<ListResultItem*>::iterator it = data->results.begin(); it != data->results.end(); ++it, i++) {
      v8::Local<v8::Object> item = NanNew<v8::Object>();
      item->Set(NanNew<v8::String>("comName"), NanNew<v8::String>((*it)->comName.c_str()));
      item->Set(NanNew<v8::String>("manufacturer"), NanNew<v8::String>((*it)->manufacturer.c_str()));
      item->Set(NanNew<v8::String>("serialNumber"), NanNew<v8::String>((*it)->serialNumber.c_str()));
      item->Set(NanNew<v8::String>("pnpId"), NanNew<v8::String>((*it)->pnpId.c_str()));
      item->Set(NanNew<v8::String>("locationId"), NanNew<v8::String>((*it)->locationId.c_str()));
      item->Set(NanNew<v8::String>("vendorId"), NanNew<v8::String>((*it)->vendorId.c_str()));
      item->Set(NanNew<v8::String>("productId"), NanNew<v8::String>((*it)->productId.c_str()));
      results->Set(i, item);
    }
    argv[0] = NanUndefined();
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
    argv[0] = v8::Exception::Error(NanNew<v8::String>(data->errorString));
    argv[1] = NanUndefined();
  } else {
    argv[0] = NanUndefined();
    argv[1] = NanNew<v8::Int32>(data->result);
  }
  data->callback->Call(2, argv);

  delete data->callback;
  delete data;
  delete req;
}

NAN_METHOD(Set) {
  NanScope();

  // file descriptor
  if(!args[0]->IsInt32()) {
    NanThrowTypeError("First argument must be an int");
    NanReturnUndefined();
  }
  int fd = args[0]->ToInt32()->Int32Value();

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

  SetBaton* baton = new SetBaton();
  memset(baton, 0, sizeof(SetBaton));
  baton->fd = fd;
  baton->callback = new NanCallback(callback);
  baton->brk = options->Get(NanNew<v8::String>("brk"))->ToBoolean()->BooleanValue();
  baton->rts = options->Get(NanNew<v8::String>("rts"))->ToBoolean()->BooleanValue();
  baton->cts = options->Get(NanNew<v8::String>("cts"))->ToBoolean()->BooleanValue();
  baton->dtr = options->Get(NanNew<v8::String>("dtr"))->ToBoolean()->BooleanValue();
  baton->dsr = options->Get(NanNew<v8::String>("dsr"))->ToBoolean()->BooleanValue();

  uv_work_t* req = new uv_work_t();
  req->data = baton;
  uv_queue_work(uv_default_loop(), req, EIO_Set, (uv_after_work_cb)EIO_AfterSet);

  NanReturnUndefined();
}

void EIO_AfterSet(uv_work_t* req) {
  NanScope();

  SetBaton* data = static_cast<SetBaton*>(req->data);

  v8::Handle<v8::Value> argv[2];

  if(data->errorString[0]) {
    argv[0] = v8::Exception::Error(NanNew<v8::String>(data->errorString));
    argv[1] = NanUndefined();
  } else {
    argv[0] = NanUndefined();
    argv[1] = NanNew<v8::Int32>(data->result);
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
    argv[0] = v8::Exception::Error(NanNew<v8::String>(data->errorString));
    argv[1] = NanUndefined();
  } else {
    argv[0] = NanUndefined();
    argv[1] = NanNew<v8::Int32>(data->result);
  }
  data->callback->Call(2, argv);

  delete data->callback;
  delete data;
  delete req;
}

// Change request for ticket #401 - credit to @sguilly
SerialPortParity NAN_INLINE(ToParityEnum(const v8::Handle<v8::String>& v8str)) {
  NanScope();
  NanUtf8String *str = new NanUtf8String(v8str);
  size_t count = strlen(**str);
  SerialPortParity parity = SERIALPORT_PARITY_NONE;
  if(!strncasecmp(**str, "none", count)) {
  parity = SERIALPORT_PARITY_NONE;
  } else if(!strncasecmp(**str, "even", count)) {
  parity = SERIALPORT_PARITY_EVEN;
  } else if(!strncasecmp(**str, "mark", count)) {
  parity = SERIALPORT_PARITY_MARK;
  } else if(!strncasecmp(**str, "odd", count)) {
  parity = SERIALPORT_PARITY_ODD;
  } else if(!strncasecmp(**str, "space", count)) {
  parity = SERIALPORT_PARITY_SPACE;
  }
  // delete[] str;
  return parity;
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
    NODE_SET_METHOD(target, "set", Set);
    NODE_SET_METHOD(target, "open", Open);
    NODE_SET_METHOD(target, "update", Update);
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
