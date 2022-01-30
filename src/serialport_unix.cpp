#include "serialport_unix.h"
#include "serialport.h"

#include <sys/file.h>
#include <unistd.h>
#include <fcntl.h>
#include <errno.h>
#include <termios.h>

#ifdef __APPLE__
#include <AvailabilityMacros.h>
#include <sys/param.h>
#endif

#if defined(MAC_OS_X_VERSION_10_4) && (MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_4)
#include <sys/ioctl.h>
#include <IOKit/serial/ioss.h>

#elif defined(__NetBSD__)
#include <sys/ioctl.h>

#elif defined(__OpenBSD__)
#include <sys/ioctl.h>

#elif defined(__linux__)
#include <sys/ioctl.h>
#include <linux/serial.h>
#include "serialport_linux.h"
#endif

int ToStopBitsConstant(SerialPortStopBits stopBits);

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
#if defined(__linux__)
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

void OpenBaton::Execute() {

  int flags = (O_RDWR | O_NOCTTY | O_NONBLOCK | O_CLOEXEC | O_SYNC);
  int fd = open(path, flags);

  if (-1 == fd) {
    snprintf(errorString, sizeof(errorString), "Error: %s, cannot open %s", strerror(errno), path);
    this->SetError(errorString);
    return;
  }

  if (-1 == setup(fd, this)) {
    this->SetError(errorString);
    close(fd);
    return;
  }

  result = fd;
}

void ConnectionOptionsBaton::Execute() {
  // lookup the standard baudrates from the table
  int baudRate = ToBaudConstant(this->baudRate);

  // get port options
  struct termios options;
  if (-1 == tcgetattr(fd, &options)) {
    snprintf(errorString, sizeof(errorString), "Error: %s setting custom baud rate of %d", strerror(errno), baudRate);
    this->SetError(errorString);
    return;
  }

  // If there is a custom baud rate on linux you can do the following trick with B38400
  #if defined(__linux__) && defined(ASYNC_SPD_CUST)
    if (baudRate == -1) {
      int err = linuxSetCustomBaudRate(fd, baudRate);

      if (err == -1) {
        snprintf(errorString, sizeof(errorString), "Error: %s || while retrieving termios2 info", strerror(errno));
        this->SetError(errorString);
        return;
      } else if (err == -2) {
        snprintf(errorString, sizeof(errorString), "Error: %s || while setting custom baud rate of %d", strerror(errno), baudRate);
        this->SetError(errorString);
        return;
      }

      return;
    }
  #endif

  // On OS X, starting with Tiger, we can set a custom baud rate with ioctl
  #if defined(MAC_OS_X_VERSION_10_4) && (MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_4)
    if (-1 == baudRate) {
      speed_t speed = baudRate;
      if (-1 == ioctl(fd, IOSSIOSPEED, &speed)) {
        snprintf(errorString, sizeof(errorString), "Error: %s calling ioctl(.., IOSSIOSPEED, %ld )", strerror(errno), speed);
        this->SetError(errorString);
        return;
      } else {
        tcflush(fd, TCIOFLUSH);
        return;
      }
    }
  #endif

  if (-1 == baudRate) {
    snprintf(errorString, sizeof(errorString), "Error baud rate of %d is not supported on your platform", baudRate);
    this->SetError(errorString);
    return;
  }

  // If we have a good baud rate set it and lets go
  cfsetospeed(&options, baudRate);
  cfsetispeed(&options, baudRate);
  // throw away all the buffered data
  tcflush(fd, TCIOFLUSH);
  // make the changes now
  tcsetattr(fd, TCSANOW, &options);
  return;
}

int setup(int fd, OpenBaton *data) {
  int dataBits = ToDataBitsConstant(data->dataBits);
  if (-1 == dataBits) {
    snprintf(data->errorString, sizeof(data->errorString),"Invalid data bits setting %d", data->dataBits);
    return -1;
  }

  // Snow Leopard doesn't have O_CLOEXEC
  if (-1 == fcntl(fd, F_SETFD, FD_CLOEXEC)) {
    snprintf(data->errorString, sizeof(data->errorString), "Error %s Cannot open %s", strerror(errno), data->path);
    return -1;
  }

  // Get port configuration for modification
  struct termios options;
  tcgetattr(fd, &options);

  // IGNPAR: ignore bytes with parity errors
  options.c_iflag = IGNPAR;

  // ICRNL: map CR to NL (otherwise a CR input on the other computer will not terminate input)
  // Future potential option
  // options.c_iflag = ICRNL;
  // otherwise make device raw (no other input processing)

  // Specify data bits
  options.c_cflag &= ~CSIZE;
  options.c_cflag |= dataBits;

  options.c_cflag &= ~(CRTSCTS);

  if (data->rtscts) {
    options.c_cflag |= CRTSCTS;
    // evaluate specific flow control options
  }

  options.c_iflag &= ~(IXON | IXOFF | IXANY);

  if (data->xon) {
    options.c_iflag |= IXON;
  }

  if (data->xoff) {
    options.c_iflag |= IXOFF;
  }

  if (data->xany) {
    options.c_iflag |= IXANY;
  }

  switch (data->parity) {
  case SERIALPORT_PARITY_NONE:
    options.c_cflag &= ~PARENB;
    // options.c_cflag &= ~CSTOPB;
    // options.c_cflag &= ~CSIZE;
    // options.c_cflag |= CS8;
    break;
  case SERIALPORT_PARITY_ODD:
    options.c_cflag |= PARENB;
    options.c_cflag |= PARODD;
    // options.c_cflag &= ~CSTOPB;
    // options.c_cflag &= ~CSIZE;
    // options.c_cflag |= CS7;
    break;
  case SERIALPORT_PARITY_EVEN:
    options.c_cflag |= PARENB;
    options.c_cflag &= ~PARODD;
    // options.c_cflag &= ~CSTOPB;
    // options.c_cflag &= ~CSIZE;
    // options.c_cflag |= CS7;
    break;
  default:
    snprintf(data->errorString, sizeof(data->errorString), "Invalid parity setting %d", data->parity);
    return -1;
  }

  switch (data->stopBits) {
  case SERIALPORT_STOPBITS_ONE:
    options.c_cflag &= ~CSTOPB;
    break;
  case SERIALPORT_STOPBITS_TWO:
    options.c_cflag |= CSTOPB;
    break;
  default:
    snprintf(data->errorString, sizeof(data->errorString), "Invalid stop bits setting %d", data->stopBits);
    return -1;
  }

  options.c_cflag |= CLOCAL;  // ignore status lines
  options.c_cflag |= CREAD;   // enable receiver
  if (data->hupcl) {
    options.c_cflag |= HUPCL;  // drop DTR (i.e. hangup) on close
  }

  // Raw output
  options.c_oflag = 0;

  // ICANON makes partial lines not readable. It should be optional.
  // It works with ICRNL.
  options.c_lflag = 0;  // ICANON;
  options.c_cc[VMIN]= data->vmin;
  options.c_cc[VTIME]= data->vtime;

  // Note that tcsetattr() returns success if any of the requested changes could be successfully carried out.
  // Therefore, when making multiple changes it may be necessary to follow this call with a further call to
  // tcgetattr() to check that all changes have been performed successfully.
  // This also fails on OSX
  tcsetattr(fd, TCSANOW, &options);

  if (data->lock) {
    if (-1 == flock(fd, LOCK_EX | LOCK_NB)) {
      snprintf(data->errorString, sizeof(data->errorString), "Error %s Cannot lock port", strerror(errno));
      return -1;
    }
  }

  // Copy the connection options into the ConnectionOptionsBaton to set the baud rate
  ConnectionOptions* connectionOptions = new ConnectionOptions();
  connectionOptions->fd = fd;
  connectionOptions->baudRate = data->baudRate;

  if (-1 == setBaudRate(connectionOptions)) {
    strncpy(data->errorString, connectionOptions->errorString, sizeof(data->errorString));
    delete(connectionOptions);
    return -1;
  }
  delete(connectionOptions);

  // flush all unread and wrote data up to this point because it could have been received or sent with bad settings
  // Not needed since setBaudRate does this for us
  // tcflush(fd, TCIOFLUSH);

  return 1;
}

int setBaudRate(ConnectionOptions *data) {
  // lookup the standard baudrates from the table
  int baudRate = ToBaudConstant(data->baudRate);
  int fd = data->fd;

  // get port options
  struct termios options;
  if (-1 == tcgetattr(fd, &options)) {
    snprintf(data->errorString, sizeof(data->errorString),
             "Error: %s setting custom baud rate of %d", strerror(errno), data->baudRate);
    return -1;
  }

  // If there is a custom baud rate on linux you can do the following trick with B38400
  #if defined(__linux__) && defined(ASYNC_SPD_CUST)
    if (baudRate == -1) {
      int err = linuxSetCustomBaudRate(fd, data->baudRate);

      if (err == -1) {
        snprintf(data->errorString, sizeof(data->errorString),
                 "Error: %s || while retrieving termios2 info", strerror(errno));
        return -1;
      } else if (err == -2) {
        snprintf(data->errorString, sizeof(data->errorString),
                 "Error: %s || while setting custom baud rate of %d", strerror(errno), data->baudRate);
        return -1;
      }

      return 1;
    }
  #endif

  // On OS X, starting with Tiger, we can set a custom baud rate with ioctl
  #if defined(MAC_OS_X_VERSION_10_4) && (MAC_OS_X_VERSION_MIN_REQUIRED >= MAC_OS_X_VERSION_10_4)
    if (-1 == baudRate) {
      speed_t speed = data->baudRate;
      if (-1 == ioctl(fd, IOSSIOSPEED, &speed)) {
        snprintf(data->errorString, sizeof(data->errorString),
                 "Error: %s calling ioctl(.., IOSSIOSPEED, %ld )", strerror(errno), speed);
        return -1;
      } else {
        tcflush(fd, TCIOFLUSH);
        return 1;
      }
    }
  #endif

  if (-1 == baudRate) {
    snprintf(data->errorString, sizeof(data->errorString), "Error baud rate of %d is not supported on your platform", data->baudRate);
    return -1;
  }

  // If we have a good baud rate set it and lets go
  cfsetospeed(&options, baudRate);
  cfsetispeed(&options, baudRate);
  // throw away all the buffered data
  tcflush(fd, TCIOFLUSH);
  // make the changes now
  tcsetattr(fd, TCSANOW, &options);
  return 1;
}

void CloseBaton::Execute() {

  if (-1 == close(fd)) {
    snprintf(errorString, sizeof(errorString), "Error: %s, unable to close fd %d", strerror(errno), fd);
    this->SetError(errorString);
  }
}

void SetBaton::Execute() {

  int bits;
  ioctl(fd, TIOCMGET, &bits);

  bits &= ~(TIOCM_RTS | TIOCM_CTS | TIOCM_DTR | TIOCM_DSR);

  if (rts) {
    bits |= TIOCM_RTS;
  }

  if (cts) {
    bits |= TIOCM_CTS;
  }

  if (dtr) {
    bits |= TIOCM_DTR;
  }

  if (dsr) {
    bits |= TIOCM_DSR;
  }

  int result = 0;
  if (brk) {
    result = ioctl(fd, TIOCSBRK, NULL);
  } else {
    result = ioctl(fd, TIOCCBRK, NULL);
  }

  if (-1 == result) {
    snprintf(errorString, sizeof(errorString), "Error: %s, cannot set", strerror(errno));
    this->SetError(errorString);
    return;
  }

  if (-1 == ioctl(fd, TIOCMSET, &bits)) {
    snprintf(errorString, sizeof(errorString), "Error: %s, cannot set", strerror(errno));
    this->SetError(errorString);
    return;
  }

  #if defined(__linux__)
  int err = linuxSetLowLatencyMode(fd, lowLatency);
  // Only report errors when the lowLatency is being set to true.  Attempting to set as false can error, since the default is false
  if (lowLatency) {
    if (err == -1) {
      snprintf(errorString, sizeof(errorString), "Error: %s, cannot get low latency", strerror(errno));
      return;
    } else if(err == -2) {
      snprintf(errorString, sizeof(errorString), "Error: %s, cannot set low latency", strerror(errno));
      return;
    }
  }
  #endif
}

void GetBaton::Execute() {
  int bits;
  if (-1 == ioctl(fd, TIOCMGET, &bits)) {
    snprintf(errorString, sizeof(errorString), "Error: %s, cannot get", strerror(errno));
    this->SetError(errorString);
    return;
  }

  cts = bits & TIOCM_CTS;
  dsr = bits & TIOCM_DSR;
  dcd = bits & TIOCM_CD;

  #if defined(__linux__) && defined(ASYNC_LOW_LATENCY)
  bool lowlatency = false;
  // Try to get low latency info, but we don't care if fails (a failure state will still return lowlatency = false)
  linuxGetLowLatencyMode(fd, &lowlatency);
  lowLatency = lowlatency;
  #else
  lowLatency = false;
  #endif
}

void GetBaudRateBaton::Execute() {
  int outbaud = -1;

  #if defined(__linux__) && defined(ASYNC_SPD_CUST)
  if (-1 == linuxGetSystemBaudRate(fd, &outbaud)) {
    snprintf(errorString, sizeof(errorString), "Error: %s, cannot get baud rate", strerror(errno));
    this->SetError(errorString);
    return;
  }
  #else
  snprintf(errorString, sizeof(errorString), "Error: System baud rate check not implemented on this platform");
  this->SetError(errorString);
  return;
  #endif

  baudRate = outbaud;
}

void FlushBaton::Execute() {

  if (-1 == tcflush(fd, TCIOFLUSH)) {
    snprintf(errorString, sizeof(errorString), "Error: %s, cannot flush", strerror(errno));
    this->SetError(errorString);
    return;
  }
}

void DrainBaton::Execute() {

  if (-1 == tcdrain(fd)) {
    snprintf(errorString, sizeof(errorString), "Error: %s, cannot drain", strerror(errno));
    this->SetError(errorString);
    return;
  }
}
