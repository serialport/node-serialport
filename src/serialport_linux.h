#ifndef SRC_SERIALPORT_LINUX_H_
#define SRC_SERIALPORT_LINUX_H_

int linuxSetCustomBaudRate(const int fd, const unsigned int baudrate);
int linuxGetSystemBaudRate(const int fd, int* const outbaud);

#endif  // SRC_SERIALPORT_LINUX_H_

