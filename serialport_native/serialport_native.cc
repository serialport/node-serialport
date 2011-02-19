// Copyright 2011 Chris Williams <chris@iterativedesigns.com>

#include "serialport_native.h"
#include <stdio.h>   /* Standard input/output definitions */
#include <string.h>  /* String function definitions */
#include <unistd.h>  /* UNIX standard function definitions */
#include <fcntl.h>   /* File control definitions */
#include <errno.h>   /* Error number definitions */
#include <termios.h> /* POSIX terminal control definitions */

#include <node.h>    /* Includes for JS, node.js and v8 *//
#include <node_buffer.h>
#include <v8.h>


#define THROW_BAD_ARGS ThrowException(Exception::TypeError(String::New("Bad argument")))


namespace node {

  using namespace v8;
  
  static Persistent<String> errno_symbol;

  static Handle<Value> Read(const Arguments& args) {
    HandleScope scope;

    if (!args[0]->IsInt32())  {
      return scope.Close(THROW_BAD_ARGS);
    }
    int fd = args[0]->Int32Value();


    char * buf = NULL;

    if (!Buffer::HasInstance(args[1])) {
      return ThrowException(Exception::Error(
                  String::New("Second argument needs to be a buffer")));
    }

    Local<Object> buffer_obj = args[1]->ToObject();
    char *buffer_data = Buffer::Data(buffer_obj);
    size_t buffer_length = Buffer::Length(buffer_obj);
    ssize_t bytes_read = read(fd, buffer_data, buffer_length);
    if (bytes_read < 0) return ThrowException(ErrnoException(errno));
    // Buffer *buffer = Buffer::New(buf, bytes_read);
    return scope.Close(Integer::New(bytes_read));
  }

  static Handle<Value> Write(const Arguments& args) {
    HandleScope scope;
    
    if (!args[0]->IsInt32())  {
      return scope.Close(THROW_BAD_ARGS);
    }
    int fd = args[0]->Int32Value();

    if (!Buffer::HasInstance(args[1])) {
      return ThrowException(Exception::Error(String::New("Second argument needs to be a buffer")));
    }

    Local<Object> buffer_obj = args[1]->ToObject();
    char *buffer_data = Buffer::Data(buffer_obj);
    size_t buffer_length = Buffer::Length(buffer_obj);
    
    int n = write(fd, buffer_data, buffer_length);
    return scope.Close(Integer::New(n));

  }

  static Handle<Value> Close(const Arguments& args) {
    HandleScope scope;
    
    if (!args[0]->IsInt32())  {
      return scope.Close(THROW_BAD_ARGS);
    }
    int fd = args[0]->Int32Value();

    close(fd);

    return scope.Close(Integer::New(1));
  }

  static Handle<Value> Open(const Arguments& args) {
    HandleScope scope;

    struct termios options; 

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

    String::Utf8Value path(args[0]->ToString());
    
    int flags = (O_RDWR | O_NOCTTY | O_NONBLOCK | O_NDELAY);
    int fd    = open(*path, flags);

    if (fd == -1) {
      perror("open_port: Unable to open /dev/ttyS0 - ");
      return scope.Close(Integer::New(fd));
    } else {
      struct sigaction saio; 
      saio.sa_handler = SIG_IGN;
      sigemptyset(&saio.sa_mask);   //saio.sa_mask = 0;
      saio.sa_flags = 0;
      //    saio.sa_restorer = NULL;
      sigaction(SIGIO,&saio,NULL);
      
      //all process to receive SIGIO
      fcntl(fd, F_SETOWN, getpid());
      fcntl(fd, F_SETFL, FASYNC);
      
      // Set baud and other configuration.
      tcgetattr(fd, &options);

      /* Specify the baud rate */
      cfsetispeed(&options, BAUD);
      cfsetospeed(&options, BAUD);
      

      /* Specify data bits */
      options.c_cflag &= ~CSIZE; 
      options.c_cflag |= DATABITS;    
    



      switch (Parity)
        {
        case 0:
        default:                       //none
          options.c_cflag &= ~PARENB;
          options.c_cflag &= ~CSTOPB;
          options.c_cflag &= ~CSIZE;
          options.c_cflag |= CS8;
          break;
        case 1:                        //odd
          options.c_cflag |= PARENB;
          options.c_cflag |= PARODD;
          options.c_cflag &= ~CSTOPB;
          options.c_cflag &= ~CSIZE;
          options.c_cflag |= CS7;
          break;
        case 2:                        //even
          options.c_cflag |= PARENB;
          options.c_cflag &= ~PARODD;
          options.c_cflag &= ~CSTOPB;
          options.c_cflag &= ~CSIZE;
          options.c_cflag |= CS7;
          break;
        }
      

      options.c_cflag |= (CLOCAL | CREAD);
      options.c_iflag = IGNPAR;
      options.c_oflag = 0;
      options.c_lflag = 0;       //ICANON;
      options.c_cc[VMIN]=1;
      options.c_cc[VTIME]=0;


      tcflush(fd, TCIFLUSH);
      tcsetattr(fd, TCSANOW, &options);

      return scope.Close(Integer::New(fd));
    }
  }




  void SerialPort::Initialize(Handle<Object> target) {
    
    HandleScope scope;

    NODE_SET_METHOD(target, "open", Open);
    NODE_SET_METHOD(target, "write", Write);
    NODE_SET_METHOD(target, "close", Close);
    NODE_SET_METHOD(target, "read", Read);

    errno_symbol = NODE_PSYMBOL("errno");


  }


  extern "C" void
  init (Handle<Object> target) 
  {
    HandleScope scope;
    SerialPort::Initialize(target);
  }


}
