'use strict';
const fs = require('fs');
const debug = require('debug');
const logger = debug('serialport:unixWrite');

module.exports = function unixWrite(buffer, offset) {
  offset = offset || 0;
  const bytesToWrite = buffer.length - offset;
  logger('Starting write', bytesToWrite, 'bytes');
  return new Promise((resolve, reject) => {
    fs.write(this.fd, buffer, offset, bytesToWrite, (err, bytesWritten) => {
      if (err && (
        err.code === 'EAGAIN' ||
        err.code === 'EWOULDBLOCK' ||
        err.code === 'EINTR'
      )) {
        logger('waiting for writable because of code:', err.code);
        this.poller.once('writable', () => {
          logger('writable!');
          resolve(this.write(buffer, offset));
        });
        return;
      }

      // const disconnectError = err && (
      //   err.code === 'EBADF' || // Bad file number means we got closed
      //   err.code === 'ENXIO' || // No such device or address probably usb disconnect
      //   err.code === 'UNKNOWN' ||
      //   err.errno === -1 // generic error
      // );

      // if (disconnectError) {
      //   logger('disconnecting');
      //   return this.disconnect(err);
      // }

      if (err) {
        return reject(err);
      }

      logger('wrote', bytesWritten, 'bytes');
      if (bytesWritten < bytesToWrite) {
        return resolve(this.write(buffer, offset));
      }

      logger('Finished write', buffer.length, 'bytes');
      resolve();
    });
  });
};
