#ifndef PACKAGES_SERIALPORT_SRC_SERIALPORT_LINUX_H_
#define PACKAGES_SERIALPORT_SRC_SERIALPORT_LINUX_H_

int linuxSetCustomBaudRate(const int fd, const unsigned int baudrate);
int linuxGetSystemBaudRate(const int fd, int* const outbaud);

#endif  // PACKAGES_SERIALPORT_SRC_SERIALPORT_LINUX_H_

