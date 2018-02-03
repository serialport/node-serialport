#include <asm/termios.h>

int ioctl(int fd, int request, ...);

void set_custom_baudrate(const int fd, const int baudrate) {
  #if defined(__linux__)
    struct termios2 t;
    ioctl(fd, TCGETS2, &t);
    t.c_cflag &= ~CBAUD;
    t.c_cflag |= BOTHER;
    t.c_ospeed = t.c_ispeed = baudrate;
    ioctl(fd, TCSETS2, &t);
  #endif
}
