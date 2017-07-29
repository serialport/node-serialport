'use strict';
const debug = require('debug');
const logger = debug('serialport:poller');
const EventEmitter = require('events');
const FDPoller = require('bindings')('serialport.node').Poller;

const EVENTS = {
  UV_READABLE: 1,
  UV_WRITABLE: 2,
  UV_DISCONNECT: 4
};

function handleEvent(error, eventFlag) {
  if (error) {
    logger('error', error);
    this.emit('readable', error);
    this.emit('writable', error);
    this.emit('disconnect', error);
    return;
  }
  if (eventFlag & EVENTS.UV_READABLE) {
    logger('received "readable"');
    this.emit('readable', null);
  }
  if (eventFlag & EVENTS.UV_WRITABLE) {
    logger('received "writable"');
    this.emit('writable', null);
  }
  if (eventFlag & EVENTS.UV_DISCONNECT) {
    logger('received "disconnect"');
    this.emit('disconnect', null);
  }
}

/**
 * Polls unix systems for readable or writable states of a file or serialport
 */
module.exports = class Poller extends EventEmitter {
  constructor(fd) {
    logger('Creating poller');
    super();
    this.poller = new FDPoller(fd, handleEvent.bind(this));
  }

  once(event) {
    switch (event) {
      case 'readable':
        this.poll(EVENTS.UV_READABLE);
        break;
      case 'writable':
        this.poll(EVENTS.UV_WRITABLE);
        break;
      case 'disconnect':
        this.poll(EVENTS.UV_DISCONNECT);
        break;
    }
    return EventEmitter.prototype.once.apply(this, arguments);
  }

  poll(eventFlag) {
    eventFlag = eventFlag || 0;

    if (eventFlag & EVENTS.UV_READABLE) {
      logger('Polling for "readable"');
    }
    if (eventFlag & EVENTS.UV_WRITABLE) {
      logger('Polling for "writable"');
    }
    if (eventFlag & EVENTS.UV_DISCONNECT) {
      logger('Polling for "disconnect"');
    }

    this.poller.poll(eventFlag);
  }

  stop() {
    logger('Stopping poller');
    this.poller.stop();
    this.emitCanceled();
  }

  emitCanceled() {
    const err = new Error('Canceled');
    err.canceled = true;
    this.emit('readable', err);
    this.emit('writable', err);
    this.emit('disconnect', err);
  }
};
