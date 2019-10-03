const fs = require('fs')
const debug = require('debug')
const logger = debug('serialport/bindings/unixRead')
const { promisify } = require('util')

const readAsync = promisify(fs.read)

const readable = binding => {
  return new Promise((resolve, reject) => {
    binding.poller.once('readable', err => (err ? reject(err) : resolve()))
  })
}

module.exports = async function unixRead(buffer, offset, length) {
  logger('Starting read')
  if (!this.isOpen) {
    throw new Error('Port is not open')
  }

  try {
    const { bytesRead } = await readAsync(this.fd, buffer, offset, length, null)
    if (bytesRead === 0) {
      return this.read(buffer, offset, length)
    }

    logger('Finished read', bytesRead, 'bytes')
    return { bytesRead, buffer }
  } catch (err) {
    if (err.code === 'EAGAIN' || err.code === 'EWOULDBLOCK' || err.code === 'EINTR') {
      if (!this.isOpen) {
        throw new Error('Port is not open')
      }
      logger('waiting for readable because of code:', err.code)
      await readable(this)
      return this.read(buffer, offset, length)
    }

    const disconnectError =
      err.code === 'EBADF' || // Bad file number means we got closed
      err.code === 'ENXIO' || // No such device or address probably usb disconnect
      err.code === 'UNKNOWN' ||
      err.errno === -1 // generic error

    if (disconnectError) {
      err.disconnect = true
      logger('disconnecting', err)
    }

    throw err
  }
}
