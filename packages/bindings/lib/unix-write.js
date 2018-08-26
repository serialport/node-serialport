const fs = require('fs')
const debug = require('debug')
const logger = debug('@serialport/bindings:unixWrite')

module.exports = function unixWrite(buffer, offset) {
  offset = offset || 0
  const bytesToWrite = buffer.length - offset
  logger(
    'Starting write',
    buffer.length,
    'bytes offset',
    offset,
    'bytesToWrite',
    bytesToWrite
  )
  if (!this.isOpen) {
    return Promise.reject(new Error('Port is not open'))
  }
  return new Promise((resolve, reject) => {
    fs.write(this.fd, buffer, offset, bytesToWrite, (err, bytesWritten) => {
      logger('write returned', err, bytesWritten)
      if (
        err &&
        (err.code === 'EAGAIN' ||
          err.code === 'EWOULDBLOCK' ||
          err.code === 'EINTR')
      ) {
        if (!this.isOpen) {
          return reject(new Error('Port is not open'))
        }
        logger('waiting for writable because of code:', err.code)
        this.poller.once('writable', err => {
          if (err) {
            return reject(err)
          }
          resolve(unixWrite.call(this, buffer, offset))
        })
        return
      }

      const disconnectError =
        err &&
        (err.code === 'EBADF' || // Bad file number means we got closed
        err.code === 'ENXIO' || // No such device or address probably usb disconnect
          err.code === 'UNKNOWN' ||
          err.errno === -1) // generic error

      if (disconnectError) {
        err.disconnect = true
        logger('disconnecting', err)
      }

      if (err) {
        logger('error', err)
        return reject(err)
      }

      logger('wrote', bytesWritten, 'bytes')
      if (bytesWritten + offset < buffer.length) {
        if (!this.isOpen) {
          return reject(new Error('Port is not open'))
        }
        return resolve(unixWrite.call(this, buffer, bytesWritten + offset))
      }

      logger('Finished writing', bytesWritten + offset, 'bytes')
      resolve()
    })
  })
}
