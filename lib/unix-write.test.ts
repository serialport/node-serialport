import { assert, shouldReject } from '../test/assert'
import { unixWrite } from './unix-write'
import { randomBytes } from 'crypto'
import { promisify } from 'util'
const randomBytesAsync = promisify(randomBytes)

const makeMockBinding = () => {
  return {
    isOpen: true,
    fd: 1,
    poller: {
      error: null,
      once(event: any, func: (err: null | Error) => void) {
        setImmediate(() => func(this.error))
      },
    },
  } as any
}

const makeFsWrite = (maxBytesToWrite = Infinity) => {
  const info = {
    bytesWritten: 0,
    writeBuffer: Buffer.alloc(0),
    writes: 0,
  }
  const fsWriteAsync: any = (fd: number, buffer: Buffer, offset: number, bytesToWrite: number) => {
    const bytesWritten = Math.min(maxBytesToWrite, bytesToWrite)
    info.bytesWritten += bytesWritten
    info.writeBuffer = Buffer.concat([info.writeBuffer, buffer.slice(offset, offset + bytesWritten)])
    info.writes++
    return {
      buffer,
      bytesWritten,
    }
  }

  return {
    info,
    fsWriteAsync,
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

const makeFsWriteError = (code: string) => {
  const err = new Error(`Error: ${code}`)
  ;(err as any).code = code
  return () => {
    throw err
  }
}

describe('unixWrite', () => {
  let mock: ReturnType<typeof makeMockBinding>
  beforeEach(() => {
    mock = makeMockBinding()
  })
  it('rejects when not open', async () => {
    mock.isOpen = false
    const writeBuffer = Buffer.alloc(8, 0)
    await shouldReject(unixWrite({ binding: mock, buffer: writeBuffer }))
  })
  it('handles writing a buffer', async () => {
    const writeBuffer = await randomBytesAsync(8)
    const { fsWriteAsync, info } = makeFsWrite()
    await unixWrite({ binding: mock, buffer: writeBuffer, fsWriteAsync })
    assert.strictEqual(info.bytesWritten, 8)
    assert.strictEqual(info.writes, 1)
    assert.deepStrictEqual(info.writeBuffer, writeBuffer)
  })
  it('handles writing less than requested number of bytes', async () => {
    const writeBuffer = await randomBytesAsync(16)
    const { fsWriteAsync, info } = makeFsWrite(8)
    await unixWrite({ binding: mock, buffer: writeBuffer, fsWriteAsync })
    assert.strictEqual(info.bytesWritten, 16)
    assert.strictEqual(info.writes, 2)
    assert.deepStrictEqual(info.writeBuffer, writeBuffer)
  })
  it('errors if the port closes after a partial write', async () => {
    const writeBuffer = await randomBytesAsync(16)
    const { fsWriteAsync: realFsWrite, info } = makeFsWrite(8)
    const fsWriteAsync = (...args: any[]) => {
      mock.isOpen = false
      return realFsWrite(...args)
    }
    await shouldReject(unixWrite({ binding: mock, buffer: writeBuffer, fsWriteAsync }))
    assert.strictEqual(info.bytesWritten, 8)
    assert.strictEqual(info.writes, 1)
  })
  it('errors if the poller errors after a partial write', async () => {
    const writeBuffer = await randomBytesAsync(16)
    const fsWriteAsync: any = () => {
      mock.poller.error = new Error('PollerError')
      makeFsWriteError('EAGAIN')()
    }
    const err = await shouldReject(unixWrite({ binding: mock, buffer: writeBuffer, fsWriteAsync }))
    assert.strictEqual(err, mock.poller.error)
  })
  it('handles retryable errors', async () => {
    const writeBuffer = await randomBytesAsync(16)
    const { fsWriteAsync: fsWriteAsyncReal, info } = makeFsWrite(8)

    const fsWriteAsync = sequenceCalls(
      fsWriteAsyncReal,
      makeFsWriteError('EAGAIN'),
      makeFsWriteError('EWOULDBLOCK'),
      makeFsWriteError('EINTR'),
      fsWriteAsyncReal,
    )

    await unixWrite({ binding: mock, buffer: writeBuffer, fsWriteAsync })
    assert.strictEqual(info.bytesWritten, 16)
    assert.strictEqual(info.writes, 2)
    assert.deepStrictEqual(info.writeBuffer, writeBuffer)
  })
  it('rejects write errors', async () => {
    const writeBuffer = Buffer.alloc(8, 0)
    await shouldReject(unixWrite({ binding: mock, buffer: writeBuffer, fsWriteAsync: makeFsWriteError('TROGDOR') }))
  })
  it('rejects an error if port closes after read a retryable error', async () => {
    const writeBuffer = Buffer.alloc(8, 0)
    const fsWriteAsync: any = () => {
      mock.isOpen = false
      makeFsWriteError('EAGAIN')()
    }
    await shouldReject(unixWrite({ binding: mock, buffer: writeBuffer, fsWriteAsync }))
  })
  it('rejects a disconnect error when fswrite errors a disconnect error', async () => {
    const writeBuffer = Buffer.alloc(8, 0)
    const fsWriteAsync = makeFsWriteError('EBADF')
    const err = await shouldReject(unixWrite({ binding: mock, buffer: writeBuffer, fsWriteAsync }))
    assert.isTrue(err.disconnect)
  })
})
