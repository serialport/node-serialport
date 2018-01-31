#if defined(__linux__)

#include <sys/ioctl.h>
#include <asm/termbits.h>

int set_custom_baudrate(const int fd, const unsigned int baudrate) {
    struct termios2 t;

    if(ioctl(fd, TCGETS2, &t)) {
      return -1;
    }

    t.c_cflag &= ~CBAUD;
    t.c_cflag |= BOTHER;
    t.c_ospeed = t.c_ispeed = baudrate;

    if(ioctl(fd, TCSETS2, &t)) {
      return -2;
    }

    return 0;
}

int get_custom_baudrate(const int fd, unsigned int * const outbaud) {
  struct termios2 t;

  if(ioctl(fd, TCGETS2, &t)) {
    return -1;
  }

  *outbaud = t.c_ospeed;

  return 0;
}

#endif
