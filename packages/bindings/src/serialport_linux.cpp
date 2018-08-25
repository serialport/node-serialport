#if defined(__linux__)

#include <sys/ioctl.h>
#include <asm/ioctls.h>
#include <asm/termbits.h>

// Uses the termios2 interface to set nonstandard baud rates
int linuxSetCustomBaudRate(const int fd, const unsigned int baudrate) {
    struct termios2 t;

    if (ioctl(fd, TCGETS2, &t)) {
      return -1;
    }

    t.c_cflag &= ~CBAUD;
    t.c_cflag |= BOTHER;
    t.c_ospeed = t.c_ispeed = baudrate;

    if (ioctl(fd, TCSETS2, &t)) {
      return -2;
    }

    return 0;
}

// Uses termios2 interface to retrieve system reported baud rate
int linuxGetSystemBaudRate(const int fd, int* const outbaud) {
  struct termios2 t;

  if (ioctl(fd, TCGETS2, &t)) {
    return -1;
  }

  *outbaud = static_cast<int>(t.c_ospeed);

  return 0;
}

#endif
