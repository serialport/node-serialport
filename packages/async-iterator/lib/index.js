const debug = require('debug')('serialport/async-iterator')

/**
 * An AsyncIterator that does something pretty cool.
 * @param {Object} options open options
 * @example ```
// To use the `AsyncIterator` interface:
const { open } = require('@serialport/async-iterator')
const Binding = require('@serialport/bindings')
const ports = await Binding.list()
const arduinoPort = ports.find(info => (info.manufacture || '').includes('Arduino'))
const port = await open(arduinoPort)

// read bytes until close
for await (const bytes of port) {
  console.log(`read ${bytes.length} bytes`)
}

// read 12 bytes
const { value, end } = await port.next(12)
console.log(`read ${value.length} bytes / port closed: ${end}`)

// write a buffer
await port.write(Buffer.from('hello!'))
```
*/

/**
 * Wrap an async function so that subsequent calls are queued behind the previous promise resolving
 */
const promiseQueue = func => {
  const queuedFunc = (...args) => {
    queuedFunc.previousCall = queuedFunc.previousCall.then(() => func(...args))
    return queuedFunc.previousCall
  }
  queuedFunc.previousCall = Promise.resolve()
  return queuedFunc
}

const open = async ({ Binding, readSize = 1024, path, bindingOptions = {}, ...openOptions }) => {
  const binding = new Binding(bindingOptions)
  debug('opening with', { path, openOptions })
  await binding.open(path, openOptions)

  const next = async (bytesToRead = readSize) => {
    if (!binding.isOpen) {
      debug('next: port is closed')
      return { value: undefined, done: true }
    }

    const readBuffer = Buffer.allocUnsafe(bytesToRead)
    try {
      debug(`next: read starting`)
      const { bytesRead } = await binding.read(readBuffer, 0, bytesToRead)
      debug(`next: read ${bytesRead} bytes`)
      const value = readBuffer.slice(0, bytesRead)
      return { value, done: false }
    } catch (error) {
      if (error.canceled) {
        debug(`next: read canceled`)
        return { value: undefined, done: true }
      }
      debug(`next: read error ${error.message}`)
      throw error
    }
  }

  const port = {
    [Symbol.asyncIterator]: () => port,
    next: promiseQueue(next),
    write: promiseQueue(data => binding.write(data)),
    close: () => binding.close(),
    update: opt => binding.update(opt),
    set: opt => binding.set(opt),
    get: () => binding.get(),
    flush: () => binding.flush(),
    drain: () => binding.drain(),
    binding,
    get isOpen() {
      return binding.isOpen
    },
  }
  return port
}

module.exports = {
  open,
}
