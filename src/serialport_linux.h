#ifndef CUSTOM_BAUDRATE_H
#define CUSTOM_BAUDRATE_H

int linuxSetCustomBaudRate(const int fd, const unsigned int baudrate);
int linuxGetSystemBaudRate(const int fd, int* const outbaud);

#endif

