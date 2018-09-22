// tslint:disable:no-bitwise
import debug from 'debug'
import { EventEmitter } from 'events'
import Bindings from 'bindings'
const logger = debug('serialport/bindings/poller')
const FDPoller = Bindings('bindings.node').Poller

interface Events {
  readonly UV_DISCONNECT: number
  readonly UV_READABLE: number
  readonly UV_WRITABLE: number
}

const EVENTS: Events = {
  UV_READABLE: 1,
  UV_WRITABLE: 2,
  UV_DISCONNECT: 4,
}

const makeHandleEvent = (poller: Poller) => {
  return (error: Error, eventFlag: number) => {
    if (error) {
      logger('error', error)
      poller.emit('readable', error)
      poller.emit('writable', error)
      poller.emit('disconnect', error)
      return
    }
    if (eventFlag & EVENTS.UV_READABLE) {
      logger('received "readable"')
      poller.emit('readable', null)
    }
    if (eventFlag & EVENTS.UV_WRITABLE) {
      logger('received "writable"')
      poller.emit('writable', null)
    }
    if (eventFlag & EVENTS.UV_DISCONNECT) {
      logger('received "disconnect"')
      poller.emit('disconnect', null)
    }
  }
}

/**
 * Polls unix systems for readable or writable states of a file or serialport
 */
export class Poller extends EventEmitter {
  static readonly EVENTS = EVENTS
  readonly poller: any

  constructor(fd: number) {
    logger('Creating poller')
    super()
    this.poller = new FDPoller(fd, makeHandleEvent(this))
  }

  destroy() {
    logger('Destroying poller')
    this.poller.destroy()
    this.emitCanceled()
  }

  emitCanceled() {
    const err = new Error('Canceled')
    ;(err as any).canceled = true
    this.emit('readable', err)
    this.emit('writable', err)
    this.emit('disconnect', err)
  }

  /**
   * Wait for the next event to occur
   */
  once(event: 'readable' | 'writable' | 'disconnect') {
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
    return EventEmitter.prototype.once.apply(this, arguments) as this
  }

  /**
   * Ask the bindings to listen for an event, it is recommend to use `.once()` for easy use
   * @param {EVENTS} eventFlag polls for an event or group of events based upon a flag.
   * @returns {undefined}
   */
  poll(eventFlag: number = 0) {
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
   * @returns {undefined}
   */
  stop() {
    logger('Stopping poller')
    this.poller.stop()
    this.emitCanceled()
  }
}
