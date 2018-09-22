import fs from 'fs'
import debug from 'debug'
import { DarwinBinding } from './darwin';
import { LinuxBinding } from './linux';
const logger = debug('serialport/bindings/unixRead')

export async function unixRead(binding: DarwinBinding | LinuxBinding, buffer: Buffer, offset: number, length: number): Promise<number> {
  logger('Starting read')
  if (!binding.fd) {
    return Promise.reject(new Error('Port is not open'))
  }
  const fd = binding.fd
  return new Promise((resolve, reject) => {
    fs.read(fd, buffer, offset, length, null, (err, bytesRead) => {
      if (err && (err.code === 'EAGAIN' || err.code === 'EWOULDBLOCK' || err.code === 'EINTR')) {
        if (!binding.isOpen) {
          return reject(new Error('Port is not open'))
        }
        logger('waiting for readable because of code:', err.code)
        binding.poller.once('readable', (pollerError: Error) => {
          if (pollerError) {
            return reject(pollerError)
          }
          resolve(binding.read(buffer, offset, length))
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
        return reject(err)
      }

      if (bytesRead === 0) {
        resolve(binding.read(buffer, offset, length))
        return
      }

      logger('Finished read', bytesRead, 'bytes')
      resolve(bytesRead)
    })
  }) as Promise<number>
}
