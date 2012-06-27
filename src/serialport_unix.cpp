
#ifndef WIN32
#include "serialport.h"
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <termios.h>

int ToBaudConstant(int baudRate);
int ToDataBitsConstant(int dataBits);
int ToStopBitsConstant(SerialPortStopBits stopBits);
int ToFlowControlConstant(bool flowControl);

void AfterOpenSuccess(int fd, v8::Handle<v8::Value> dataCallback, v8::Handle<v8::Value> disconnectedCallback, v8::Handle<v8::Value> errorCallback) {

}

int ToBaudConstant(int baudRate) {
  switch (baudRate) {
    case 0: return B0;
    case 50: return B50;
    case 75: return B75;
    case 110: return B110;
    case 134: return B134;
    case 150: return B150;
    case 200: return B200;
    case 300: return B300;
    case 600: return B600;
    case 1200: return B1200;
    case 1800: return B1800;
    case 2400: return B2400;
    case 4800: return B4800;
    case 9600: return B9600;
    case 19200: return B19200;
    case 38400: return B38400;
    case 57600: return B57600;
    case 115200: return B115200;
    case 230400: return B230400;
#ifndef __APPLE__
    case 460800: return B460800;
    case 500000: return B500000;
    case 576000: return B576000;
    case 921600: return B921600;
    case 1000000: return B1000000;
    case 1152000: return B1152000;
    case 1500000: return B1500000;
    case 2000000: return B2000000;
    case 2500000: return B2500000;
    case 3000000: return B3000000;
    case 3500000: return B3500000;
    case 4000000: return B4000000;
#endif
  }
  return -1;
}

int ToDataBitsConstant(int dataBits) {
  switch (dataBits) {
    case 8: default: return CS8;
    case 7: return CS7;
    case 6: return CS6;
    case 5: return CS5;
  }
  return -1;
}

int ToFlowControlConstant(bool flowControl) {
  return flowControl ? CRTSCTS : 0;
}

void EIO_Open(uv_work_t* req) {
  OpenBaton* data = static_cast<OpenBaton*>(req->data);

  int baudRate = ToBaudConstant(data->baudRate);
  if(baudRate == -1) {
    sprintf(data->errorString, "Invalid baud rate setting %d", data->baudRate);
    return;
  }

  int dataBits = ToDataBitsConstant(data->dataBits);
  if(dataBits == -1) {
    sprintf(data->errorString, "Invalid data bits setting %d", data->dataBits);
    return;
  }

  int flowControl = ToFlowControlConstant(data->flowControl);
  if(flowControl == -1) {
    sprintf(data->errorString, "Invalid flow control setting %d", data->flowControl);
    return;
  }

  int flags = (O_RDWR | O_NOCTTY | O_NONBLOCK | O_NDELAY);
  int fd = open(data->path, flags);

  if (fd == -1) {
    sprintf(data->errorString, "Cannot open %s", data->path);
    return;
  }

  struct termios options;
  struct sigaction saio;
  saio.sa_handler = SIG_IGN;
  sigemptyset(&saio.sa_mask);
  saio.sa_flags = 0;
  sigaction(SIGIO, &saio, NULL);

  //all process to receive SIGIO
  fcntl(fd, F_SETOWN, getpid());
  fcntl(fd, F_SETFL, FASYNC);

  // Set baud and other configuration.
  tcgetattr(fd, &options);

  // Specify the baud rate
  cfsetispeed(&options, baudRate);
  cfsetospeed(&options, baudRate);

  // Specify data bits
  options.c_cflag &= ~CSIZE;
  options.c_cflag |= dataBits;

  // Specify flow control
  options.c_cflag &= ~flowControl;
  options.c_cflag |= flowControl;

  switch (data->parity)
  {
  case SERIALPORT_PARITY_NONE:
    options.c_cflag &= ~PARENB;
    options.c_cflag &= ~CSTOPB;
    options.c_cflag &= ~CSIZE;
    options.c_cflag |= CS8;
    break;
  case SERIALPORT_PARITY_ODD:
    options.c_cflag |= PARENB;
    options.c_cflag |= PARODD;
    options.c_cflag &= ~CSTOPB;
    options.c_cflag &= ~CSIZE;
    options.c_cflag |= CS7;
    break;
  case SERIALPORT_PARITY_EVEN:
    options.c_cflag |= PARENB;
    options.c_cflag &= ~PARODD;
    options.c_cflag &= ~CSTOPB;
    options.c_cflag &= ~CSIZE;
    options.c_cflag |= CS7;
    break;
  default:
    sprintf(data->errorString, "Invalid parity setting %d", data->parity);
    close(fd);
    return;
  }

  switch(data->stopBits) {
  case SERIALPORT_STOPBITS_ONE:
    options.c_cflag &= ~CSTOPB;
    break;
  case SERIALPORT_STOPBITS_TWO:
    options.c_cflag |= CSTOPB;
    break;
  default:
    sprintf(data->errorString, "Invalid stop bits setting %d", data->stopBits);
    close(fd);
    return;
  }

  options.c_cflag |= CLOCAL; //ignore status lines
  options.c_cflag |= CREAD;  //enable receiver
  options.c_cflag |= HUPCL;  //drop DTR (i.e. hangup) on close
  options.c_iflag = IGNPAR;
  options.c_oflag = 0;
  options.c_lflag = 0; //ICANON;
  options.c_cc[VMIN]=1;
  options.c_cc[VTIME]=0;

  tcflush(fd, TCIFLUSH);
  tcsetattr(fd, TCSANOW, &options);

  data->result = fd;
}

void EIO_Write(uv_work_t* req) {
  WriteBaton* data = static_cast<WriteBaton*>(req->data);

  int bytesWritten = write(data->fd, data->bufferData, data->bufferLength);

  data->result = bytesWritten;
}

void EIO_Close(uv_work_t* req) {
  CloseBaton* data = static_cast<CloseBaton*>(req->data);

  close(data->fd);
}

void EIO_List(uv_work_t* req) {
  // This code exists in javascript for unix platforms
}

#endif
