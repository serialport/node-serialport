import { assert, shouldReject } from '../test/assert'
import { LinuxBinding } from './linux'
import { unixRead } from './unix-read'

const makeFsRead =
  (bytesRead: number, fill: number): any =>
    (fd: number, buffer: Buffer, offset: number, length: number) => {
      buffer.fill(fill, offset, Math.min(length, bytesRead))
      return {
        buffer,
        bytesRead,
      }
    }

const makeFsReadError = (code: string) => {
  const err = new Error(`Error: ${code}`)
  ;(err as any).code = code
  return () => {
    throw err
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
const sequenceCalls = (...functions: Function[]) => {
  const funcs = [...functions]
  return (...args: any[]) => {
    const func = funcs.shift()
    if (func) {
      return func(...args)
    } else {
      throw new Error('"sequenceCalls" has no more functions')
    }
  }
}

const makeMockBinding = (): LinuxBinding => {
  return {
    isOpen: true,
    fd: 1,
    poller: {
      once(event: any, func: () => void) {
        setImmediate(func)
      },
    },
  } as any
}

describe('unixRead', () => {
  let mock: LinuxBinding
  beforeEach(() => {
    mock = makeMockBinding()
  })
  it('rejects when not open', async () => {
    (mock as any).isOpen = false
    const readBuffer = Buffer.alloc(8, 0)
    await shouldReject(unixRead({ binding: mock, buffer: readBuffer, offset: 0, length: 8, fsReadAsync: makeFsRead(8, 255) }))
  })
  it('handles reading the requested number of bytes', async () => {
    const readBuffer = Buffer.alloc(8, 0)
    const { bytesRead, buffer } = await unixRead({ binding: mock, buffer: readBuffer, offset: 0, length: 8, fsReadAsync: makeFsRead(8, 255) })
    assert.strictEqual(bytesRead, 8)
    assert.strictEqual(buffer, readBuffer)
    assert.deepStrictEqual(buffer, Buffer.alloc(8, 255))
  })
  it('handles reading less than requested number of bytes', async () => {
    const readBuffer = Buffer.alloc(8, 0)
    const { bytesRead, buffer } = await unixRead({ binding: mock, buffer: readBuffer, offset: 0, length: 8, fsReadAsync: makeFsRead(4, 255) })
    assert.strictEqual(bytesRead, 4)
    assert.strictEqual(buffer, readBuffer)
    assert.deepStrictEqual(buffer, Buffer.from([255, 255, 255, 255, 0, 0, 0, 0]))
  })
  it('handles reading 0 bytes then requested number of bytes', async () => {
    const readBuffer = Buffer.alloc(8, 0)

    const fsReadAsync = sequenceCalls(makeFsRead(0, 0), makeFsRead(8, 255))
    const { bytesRead, buffer } = await unixRead({ binding: mock, buffer: readBuffer, offset: 0, length: 8, fsReadAsync })
    assert.strictEqual(bytesRead, 8)
    assert.strictEqual(buffer, readBuffer)
    assert.deepStrictEqual(buffer, Buffer.alloc(8, 255))
  })
  it('handles retryable errors', async () => {
    const readBuffer = Buffer.alloc(8, 0)

    const fsReadAsync = sequenceCalls(makeFsReadError('EAGAIN'), makeFsReadError('EWOULDBLOCK'), makeFsReadError('EINTR'), makeFsRead(8, 255))
    const { bytesRead, buffer } = await unixRead({ binding: mock, buffer: readBuffer, offset: 0, length: 8, fsReadAsync })
    assert.strictEqual(bytesRead, 8)
    assert.strictEqual(buffer, readBuffer)
    assert.deepStrictEqual(buffer, Buffer.alloc(8, 255))
  })
  it('rejects read errors', async () => {
    const readBuffer = Buffer.alloc(8, 0)
    await shouldReject(unixRead({ binding: mock, buffer: readBuffer, offset: 0, length: 8, fsReadAsync: makeFsReadError('Error') }))
  })
  it('rejects a canceled error if port closes after read a retryable error', async () => {
    const readBuffer = Buffer.alloc(8, 0)
    const fsReadAsync: any = () => {
      (mock as any).isOpen = false
      makeFsReadError('EAGAIN')()
    }
    const err = await shouldReject(unixRead({ binding: mock, buffer: readBuffer, offset: 0, length: 8, fsReadAsync }))
    assert.isTrue(err.canceled)
  })
  it('rejects a disconnected error when fsread errors a disconnect error', async () => {
    const readBuffer = Buffer.alloc(8, 0)
    const fsReadAsync = makeFsReadError('EBADF')
    const err = await shouldReject(unixRead({ binding: mock, buffer: readBuffer, offset: 0, length: 8, fsReadAsync }))
    assert.isTrue(err.disconnect)
  })
})
