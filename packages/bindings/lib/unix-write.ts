import fs from 'fs'
import debug from 'debug'
import { DarwinBinding } from './darwin'
import { LinuxBinding } from './linux'
const logger = debug('serialport/bindings/unixWrite')

export async function unixWrite(binding: DarwinBinding | LinuxBinding, buffer: Buffer, offset = 0): Promise<void> {
  const bytesToWrite = buffer.length - offset
  logger('Starting write', buffer.length, 'bytes offset', offset, 'bytesToWrite', bytesToWrite)
  if (!binding.fd) {
    return Promise.reject(new Error('Port is not open'))
  }
  const fd = binding.fd
  return new Promise((resolve, reject) => {
    fs.write(fd, buffer, offset, bytesToWrite, (err, bytesWritten) => {
      logger('write returned', err, bytesWritten)
      if (err && (err.code === 'EAGAIN' || err.code === 'EWOULDBLOCK' || err.code === 'EINTR')) {
        if (!binding.isOpen) {
          return reject(new Error('Port is not open'))
        }
        logger('waiting for writable because of code:', err.code)
        binding.poller.once('writable', (pollerError: Error) => {
          if (pollerError) {
            return reject(pollerError)
          }
          resolve(unixWrite.call(binding, buffer, offset))
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
        ;(err as any).disconnect = true
        logger('disconnecting', err)
      }

      if (err) {
        logger('error', err)
        return reject(err)
      }

      logger('wrote', bytesWritten, 'bytes')
      if (bytesWritten + offset < buffer.length) {
        if (!binding.isOpen) {
          return reject(new Error('Port is not open'))
        }
        return resolve(unixWrite.call(binding, buffer, bytesWritten + offset))
      }

      logger('Finished writing', bytesWritten + offset, 'bytes')
      resolve()
    })
  }) as Promise<void>
}
