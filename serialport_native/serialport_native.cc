// Copyright 2010 Chris Williams <chris@iterativedesigns.com>
#include <serialport_native.h>

#include <sys/types.h>
#include <sys/stat.h>
#include <dirent.h>
#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>
#include <assert.h>
#include <string.h>
#include <errno.h>
#include <limits.h>

#include <termios.h>
#include <stdio.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/signal.h>
#include <sys/types.h>

using namespace v8;
using namespace node;



static Persistent<String> encoding_symbol;
static Persistent<String> errno_symbol;

#define THROW_BAD_ARGS ThrowException(Exception::TypeError(String::New("Bad argument")))

static inline Local<Value> errno_exception(int errorno) {
  Local<Value> e = Exception::Error(String::NewSymbol(strerror(errorno)));
  Local<Object> obj = e->ToObject();
  obj->Set(errno_symbol, Integer::New(errorno));
  return e;
}

static int After(eio_req *req) {
  HandleScope scope;

  Persistent<Function> *callback = cb_unwrap(req->data);

  ev_unref(EV_DEFAULT_UC);

  int argc = 0;
  Local<Value> argv[6];  // 6 is the maximum number of args

  if (req->errorno != 0) {
    argc = 1;
    argv[0] = errno_exception(req->errorno);
  } else {
    // Note: the error is always given the first argument of the callback.
    // If there is no error then then the first argument is null.
    argv[0] = Local<Value>::New(Null());

    switch (req->type) {
      case EIO_CLOSE:
      case EIO_RENAME:
      case EIO_UNLINK:
      case EIO_RMDIR:
      case EIO_MKDIR:
      case EIO_FTRUNCATE:
      case EIO_LINK:
      case EIO_SYMLINK:
      case EIO_CHMOD:
        argc = 0;
        break;

      case EIO_OPEN:
      case EIO_SENDFILE:
        argc = 2;
        argv[1] = Integer::New(req->result);
        break;

      case EIO_WRITE:
        argc = 2;
        argv[1] = Integer::New(req->result);
        break;

      case EIO_STAT:
      case EIO_LSTAT:
      {
        struct stat *s = reinterpret_cast<struct stat*>(req->ptr2);
        argc = 2;
        argv[1] = BuildStatsObject(s);
        break;
      }
      
      case EIO_READLINK:
      {
        argc = 2;
        argv[1] = String::New(static_cast<char*>(req->ptr2), req->result);
        break;
      }

      case EIO_READ:
      {
        argc = 3;
        Local<Object> obj = Local<Object>::New(*callback);
        Local<Value> enc_val = obj->GetHiddenValue(encoding_symbol);
        argv[1] = Encode(req->ptr2, req->result, ParseEncoding(enc_val));
        argv[2] = Integer::New(req->result);
        break;
      }

      case EIO_READDIR:
      {
        char *namebuf = static_cast<char*>(req->ptr2);
        int nnames = req->result;

        Local<Array> names = Array::New(nnames);

        for (int i = 0; i < nnames; i++) {
          Local<String> name = String::New(namebuf);
          names->Set(Integer::New(i), name);
#ifndef NDEBUG
          namebuf += strlen(namebuf);
          assert(*namebuf == '\0');
          namebuf += 1;
#else
          namebuf += strlen(namebuf) + 1;
#endif
        }

        argc = 2;
        argv[1] = names;
        break;
      }

      default:
        assert(0 && "Unhandled eio response");
    }
  }

  if (req->type == EIO_WRITE) {
    assert(req->ptr2);
    delete [] reinterpret_cast<char*>(req->ptr2);
  }

  TryCatch try_catch;

  (*callback)->Call(Context::GetCurrent()->Global(), argc, argv);

  if (try_catch.HasCaught()) {
    FatalException(try_catch);
  }

  // Dispose of the persistent handle
  cb_destroy(callback);

  return 0;
}


#define ASYNC_CALL(func, callback, ...)                           \
  eio_req *req = eio_##func(__VA_ARGS__, EIO_PRI_DEFAULT, After,  \
    cb_persist(callback));                                        \
  assert(req);                                                    \
  ev_ref(EV_DEFAULT_UC);                                          \
  return Undefined();



static Persistent<String> data_symbol;


class SerialPort : public EventEmitter {
  public:
    static void
    Initialize (v8::Handle<v8::Object> target)
    {
      HandleScope scope;
      Local<FunctionTemplate> t = FunctionTemplate::New(New);

      t->Inherit(EventEmitter::constructor_template);
      t->InstanceTemplate()->SetInternalFieldCount(1);
      
      data_symbol = NODE_PSYMBOL("data");
      
      // NODE_SET_PROTOTYPE_METHOD(t, "open", Open);
      NODE_SET_PROTOTYPE_METHOD(t, "close", Close);
      // NODE_SET_PROTOTYPE_METHOD(t, "write", Write);
      target->Set(String::NewSymbol("SerialPort"), t->GetFunction());
      
    }
    
    
    void signal_handler_IO (int status)
    {
       printf("received SIGIO signal.\n");
    }


    static Handle<Value> Open(const char* device, int baudrate, int databits, int stopbits, int parity) {
      HandleScope scope;

      struct termios newtio; 

      long BAUD;
      long DATABITS;
      long STOPBITS;
      long PARITYON;
      long PARITY;


      switch (baudrate)
        {
        case 38400:
        default:
          BAUD = B38400;
          break;
        case 19200:
          BAUD  = B19200;
          break;
        case 9600:
          BAUD  = B9600;
          break;
        case 4800:
          BAUD  = B4800;
          break;
        case 2400:
          BAUD  = B2400;
          break;
        case 1800:
          BAUD  = B1800;
          break;
        case 1200:
          BAUD  = B1200;
          break;
        case 600:
          BAUD  = B600;
          break;
        case 300:
          BAUD  = B300;
          break;
        case 200:
          BAUD  = B200;
          break;
        case 150:
          BAUD  = B150;
          break;
        case 134:
          BAUD  = B134;
          break;
        case 110:
          BAUD  = B110;
          break;
        case 75:
          BAUD  = B75;
          break;
        case 50:
          BAUD  = B50;
          break;
        }

      switch (databits)
        {
        case 8:
        default:
          DATABITS = CS8;
          break;
        case 7:
          DATABITS = CS7;
          break;
        case 6:
          DATABITS = CS6;
          break;
        case 5:
          DATABITS = CS5;
          break;
        }
      switch (stopbits)
        {
        case 1:
        default:
          STOPBITS = 0;
          break;
        case 2:
          STOPBITS = CSTOPB;
          break;
        } 


      switch (parity)
        {
        case 0:
        default:                       //none
          PARITYON = 0;
          PARITY = 0;
          break;
        case 1:                        //odd
          PARITYON = PARENB;
          PARITY = PARODD;
          break;
        case 2:                        //even
          PARITYON = PARENB;
          PARITY = 0;
          break;
        }


      String::Utf8Value path(device->ToString());

      int flags = (O_RDWR | O_NOCTTY | O_NONBLOCK);

      int fd = open(*path, flags);
      if (fd < 0) return scope.Close(ThrowException(errno_exception(errno)));

      struct sigaction saio; 
      saio.sa_handler = signal_handler_IO;
      sigemptyset(&saio.sa_mask);   //saio.sa_mask = 0;
      saio.sa_flags = 0;
      //    saio.sa_restorer = NULL;
      sigaction(SIGIO,&saio,NULL);

      //all process to receive SIGIO
      fcntl(fd, F_SETOWN, getpid());
      fcntl(fd, F_SETFL, FASYNC);


      newtio.c_cflag = BAUD | CRTSCTS | DATABITS | STOPBITS | PARITYON | PARITY | CLOCAL | CREAD;
      newtio.c_iflag = IGNPAR;
      newtio.c_oflag = 0;
      newtio.c_lflag = 0;       //ICANON;
      newtio.c_cc[VMIN]=1;
      newtio.c_cc[VTIME]=0;
      tcflush(fd, TCIFLUSH);
      tcsetattr(fd,TCSANOW,&newtio);


      return scope.Close(Integer::New(fd));
    }


    int Write(const char* buf, enum encoding enc) {
      // 
      // if (args.Length() < 3 || !args[0]->IsInt32()) {
      //   return scope.Close(THROW_BAD_ARGS);
      // }

      off_t offset = -1;
      // 
      // enum encoding enc = ParseEncoding(args[2]);
      ssize_t len = DecodeBytes(args[1], enc);
      if (len < 0) {
        return ThrowException(Exception::TypeError(String::New("Bad argument")));
      }

      char * buf = new char[len];
      ssize_t written = DecodeWrite(buf, len, args[1], enc);
      assert(written == len);

      // if (args[3]->IsFunction()) {
      //   ASYNC_CALL(write, args[3], fd, buf, len, offset)
      // } else {
      written = write(_fd, buf, len);
      if (written < 0) return ThrowException(errno_exception(errno));
      return Integer::New(written);
      // }
    }

    void Close (Local<Value> exception = Local<Value>())
    {
      int ret = 0;
      if (_fd)  {
        int ret = close(_fd);
      }
      if (ret != 0) {
        return ThrowException(errno_exception(errno));
      }
      _fd = NULL;
      Unref();
    }
    
    
    
  protected:
    
    static Handle<Value>
    New (const Arguments& args)
    {
      HandleScope scope;

      SerialPort *serial_port = new SerialPort();
      serial_port->Wrap(args.This());

      return scope.Close(args.This());
    }
    
    static Handle<Value>
      Close (const Arguments& args) 
      {
        
      }
      
      
    static Handle<Value>
      Write (const Arguments& args)
      {
        
      }
    static Handle<Value>
      Open (const Arguments& args)
      {
        HandleScope scope;
        
        SerialPort *serial_port = ObjectWrap::Unwrap<Connection>(args.This());
        
        long baudrate = 38400;
        int databits = 8;
        int stopbits = 1;
        int parity = 0;

        if (!args[0]->IsString()) {
          return scope.Close(ThrowException(Exception::Error(
                String::New("Must give serial device string as argument"))));
        }

        // Baud Rate Argument
        if (args.Length() >= 2 && !args[1]->IsInt32()) {
          return scope.Close(ThrowException(Exception::Error(
                String::New("If giving baud rate, must be a integer value."))));
        } else {
          baudrate = args[1]->Int32Value();
        }

        // Data Bits Argument
        if (args.Length() >= 3 && !args[2]->IsInt32()) {
          return scope.Close(ThrowException(Exception::Error(
                String::New("If giving data bits, must be a integer value."))));
        } else {
          databits = args[2]->Int32Value();
        }

        // Stop Bits Arguments
        if (args.Length() >= 4 && !args[3]->IsInt32()) {
          return scope.Close(ThrowException(Exception::Error(
                String::New("If giving stop bits, must be a integer value."))));
        } else {
          stopbits = args[3]->Int32Value();
        }

        // parity Arguments
        if (args.Length() >= 5 && !args[4]->IsInt32()) {
          return scope.Close(ThrowException(Exception::Error(
                String::New("If giving parity, must be a integer value."))));
        } else {
          parity = args[4]->Int32Value();
        }
        
        
        
        bool r = serial_port->Open(args[0], baudrate, databits, stopbits, parity);
        if (!r) {
          return ThrowException(Exception::Error(
                String::New(connection->ErrorMessage())));
        }

        return scope.Close(Undefined());
      }

    
    
    
    SerialPort () : EventEmitter () 
      {
        _fd = NULL;
      }

      ~SerialPort ()
      {
        assert(_fd == NULL);
      }
    
    
    
    
  private:
    static inline Local<Value> errno_exception(int errorno) {
      Local<Value> e = Exception::Error(String::NewSymbol(strerror(errorno)));
      Local<Object> obj = e->ToObject();
      obj->Set(errno_symbol, Integer::New(errorno));
      return e;
    }
}





  extern "C" void
  init (Handle<Object> target) 
  {
    HandleScope scope;
    SerialPort::Initialize(target);
  }
}


