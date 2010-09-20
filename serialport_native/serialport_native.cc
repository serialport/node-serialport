// Copyright 2010 Chris Williams <chris@iterativedesigns.com>
#include "serialport_native.h"
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

#include <node.h>
#include <v8.h>



#define THROW_BAD_ARGS ThrowException(Exception::TypeError(String::New("Bad argument")))


namespace node {

  using namespace v8;


  static inline Local<Value> errno_exception(int errorno) {
    Local<Value> e = Exception::Error(String::NewSymbol(strerror(errorno)));
    Local<Object> obj = e->ToObject();
    obj->Set(NODE_PSYMBOL("errno"), Integer::New(errorno));
    return e;
  }
  
  static Handle<Value> Open(const Arguments& args) {
    HandleScope scope;

    struct termios newtio; 

    long Baud_Rate = 38400;
    int Data_Bits = 8;
    int Stop_Bits = 1;
    int Parity = 0;

    long BAUD;
    long DATABITS;
    long STOPBITS;
    long PARITYON;
    long PARITY;

    if (!args[0]->IsString()) {
      return scope.Close(THROW_BAD_ARGS);
    }
    
    // Baud Rate Argument
    if (args.Length() >= 2 && !args[1]->IsInt32()) {
      return scope.Close(THROW_BAD_ARGS);
    } else {
      Baud_Rate = args[1]->Int32Value();
    }

    // Data Bits Argument
    if (args.Length() >= 3 && !args[2]->IsInt32()) {
      return scope.Close(THROW_BAD_ARGS);
    } else {
      Data_Bits = args[2]->Int32Value();
    }

    // Stop Bits Arguments
    if (args.Length() >= 4 && !args[3]->IsInt32()) {
      return scope.Close(THROW_BAD_ARGS);
    } else {
      Stop_Bits = args[2]->Int32Value();
    }

    // Parity Arguments
    if (args.Length() >= 5 && !args[4]->IsInt32()) {
      return scope.Close(THROW_BAD_ARGS);
    } else {
      Parity = args[2]->Int32Value();
    }






    switch (Baud_Rate)
      {
      case 38400:
      default:
        BAUD = B38400;
        break;
      case 115200:
        BAUD = B115200;
        break;
      case 76800:
        BAUD = B76800;
        break;
      case 57600:
        BAUD = B57600;
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
    
    switch (Data_Bits)
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
    switch (Stop_Bits)
      {
      case 1:
      default:
        STOPBITS = 0;
        break;
      case 2:
        STOPBITS = CSTOPB;
        break;
      } 


    switch (Parity)
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


    String::Utf8Value path(args[0]->ToString());
    
    int flags = (O_RDWR | O_NOCTTY | O_NONBLOCK);
    
    int fd = open(*path, flags);
    if (fd < 0) return scope.Close(ThrowException(errno_exception(errno)));

    struct sigaction saio; 
    saio.sa_handler = SIG_IGN;
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



  void SerialPort::Initialize(Handle<Object> target) {
    HandleScope scope;
    NODE_SET_METHOD(target, "open", Open);
  }


  extern "C" void
  init (Handle<Object> target) 
  {
    HandleScope scope;
    SerialPort::Initialize(target);
  }


}

//-------------



