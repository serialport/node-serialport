'use strict';
const debug = require('debug');
const logger = debug('serialport:poller');
const EventEmitter = require('events');
const FDPoller = require('bindings')('serialport.node').Poller;

const EVENTS = {
  UV_READABLE: 1,
  UV_WRITABLE: 2,
  UV_DISCONNECT: 3
};

function handleEvent(error, eventFlag) {
  if (error) {
    logger('error', error);
    return this.emit('error', error);
  }
  if (eventFlag & EVENTS.UV_READABLE) {
    logger('readable');
    this.emit('readable');
  }
  if (eventFlag & EVENTS.UV_WRITABLE) {
    logger('writable');
    this.emit('writable');
  }
  if (eventFlag & EVENTS.UV_DISCONNECT) {
    logger('disconnect');
    this.emit('disconnect');
  }
}

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

  poll(events) {
    events = events || 0;
    logger('Polling for', events);
    this.poller.poll(events);
  }

  stop() {
    logger('Stopping poller');
    this.poller.stop();
  }
};
