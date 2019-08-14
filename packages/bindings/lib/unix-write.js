const fs = require('fs')
const debug = require('debug')
const logger = debug('serialport/bindings/unixWrite')
const { promisify } = require('util')

const writeAsync = promisify(fs.write)

const writable = binding => {
  return new Promise((resolve, reject) => {
    binding.poller.once('writable', err => (err ? reject(err) : resolve()))
  })
}

module.exports = async function unixWrite(buffer, offset) {
  offset = offset || 0
  const bytesToWrite = buffer.length - offset
  logger('Starting write', buffer.length, 'bytes offset', offset, 'bytesToWrite', bytesToWrite)
  if (!this.isOpen) {
    throw new Error('Port is not open')
  }
  try {
    const { bytesWritten } = await writeAsync(this.fd, buffer, offset, bytesToWrite)
    logger('write returned: wrote', bytesWritten, 'bytes')
    if (bytesWritten + offset < buffer.length) {
      if (!this.isOpen) {
        throw new Error('Port is not open')
      }
      return unixWrite.call(this, buffer, bytesWritten + offset)
    }

    logger('Finished writing', bytesWritten + offset, 'bytes')
  } catch (err) {
    logger('write errored', err)
    if (err.code === 'EAGAIN' || err.code === 'EWOULDBLOCK' || err.code === 'EINTR') {
      if (!this.isOpen) {
        throw new Error('Port is not open')
      }
      logger('waiting for writable because of code:', err.code)
      await writable(this)
      return unixWrite.call(this, buffer, offset)
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

    logger('error', err)
    throw err
  }
}
