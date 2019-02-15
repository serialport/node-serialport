import fs from 'fs'
import debug from 'debug'
import { DarwinBinding } from './darwin'
import { LinuxBinding } from './linux'
import { promisify } from 'util'
const asyncRead = promisify(fs.read)
const logger = debug('serialport/bindings/unixRead')

export async function unixRead(binding: DarwinBinding | LinuxBinding, buffer: Buffer, offset: number, length: number) {
  logger('Starting read')
  if (!binding.descriptor) {
    return Promise.reject(new Error('Port is not open'))
  }
  const fd = binding.descriptor

  try {
    const { bytesRead } = await asyncRead(fd, buffer, offset, length, null)
    if (bytesRead === 0) {
      return binding.read(buffer, offset, length)
    }
    logger('Finished read', bytesRead, 'bytes')
    return bytesRead
  } catch (err) {
    if (binding.isClosed) {
      return 0
    }
    if (err.code === 'EAGAIN' || err.code === 'EWOULDBLOCK' || err.code === 'EINTR') {
      logger('waiting for readable because of code:', err.code)
      await binding.poller.onceAsync('readable')
      return binding.read(buffer, offset, length)
    }

    const disconnectError =
      err.code === 'EBADF' || // Bad file number means we got closed
      err.code === 'ENXIO' || // No such device or address probably usb disconnect
      err.code === 'UNKNOWN' ||
      err.errno === -1 // generic error

    if (disconnectError) {
      return 0
    }

    throw err
  }
}
