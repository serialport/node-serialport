import debug from 'debug'
import { EventEmitter } from 'events'
import { join } from 'path'
import nodeGypBuild from 'node-gyp-build'
import { CanceledError } from './errors'

const { Poller: PollerBindings } = nodeGypBuild(join(__dirname, '../')) as any
const logger = debug('serialport/bindings/poller')

export const EVENTS = {
  UV_READABLE: 0b0001,
  UV_WRITABLE: 0b0010,
  UV_DISCONNECT: 0b0100,
}

function handleEvent(error: Error, eventFlag: number) {
  if (error) {
    logger('error', error)
    this.emit('readable', error)
    this.emit('writable', error)
    this.emit('disconnect', error)
    return
  }
  if (eventFlag & EVENTS.UV_READABLE) {
    logger('received "readable"')
    this.emit('readable', null)
  }
  if (eventFlag & EVENTS.UV_WRITABLE) {
    logger('received "writable"')
    this.emit('writable', null)
  }
  if (eventFlag & EVENTS.UV_DISCONNECT) {
    logger('received "disconnect"')
    this.emit('disconnect', null)
  }
}

/**
 * Polls unix systems for readable or writable states of a file or serialport
 */
export class Poller extends EventEmitter {
  poller: any
  constructor(fd: number, FDPoller = PollerBindings) {
    logger('Creating poller')
    super()
    this.poller = new FDPoller(fd, handleEvent.bind(this))
  }
  /**
   * Wait for the next event to occur
   * @param {string} event ('readable'|'writable'|'disconnect')
   * @returns {Poller} returns itself
   */
  once(event: 'readable' | 'writable' | 'disconnect', callback: (err: null | Error) => void): this {
    switch (event) {
    case 'readable':
      this.poll(EVENTS.UV_READABLE)
      break
    case 'writable':
      this.poll(EVENTS.UV_WRITABLE)
      break
    case 'disconnect':
      this.poll(EVENTS.UV_DISCONNECT)
      break
    }
    return super.once(event, callback)
  }

  /**
   * Ask the bindings to listen for an event, it is recommend to use `.once()` for easy use
   * @param {EVENTS} eventFlag polls for an event or group of events based upon a flag.
   */
  poll(eventFlag = 0) {
    if (eventFlag & EVENTS.UV_READABLE) {
      logger('Polling for "readable"')
    }
    if (eventFlag & EVENTS.UV_WRITABLE) {
      logger('Polling for "writable"')
    }
    if (eventFlag & EVENTS.UV_DISCONNECT) {
      logger('Polling for "disconnect"')
    }

    this.poller.poll(eventFlag)
  }

  /**
   * Stop listening for events and cancel all outstanding listening with an error
   */
  stop(): void {
    logger('Stopping poller')
    this.poller.stop()
    this.emitCanceled()
  }

  destroy(): void {
    logger('Destroying poller')
    this.poller.destroy()
    this.emitCanceled()
  }

  emitCanceled(): void {
    const err = new CanceledError('Canceled')
    this.emit('readable', err)
    this.emit('writable', err)
    this.emit('disconnect', err)
  }
}
