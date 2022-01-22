import { Poller } from './poller'
import { assert } from '../test/assert'

class MockPollerBindings {
  fd: number
  callback: any
  lastPollFlag: string
  constructor(fd: number, callback: any) {
    this.fd = fd
    this.callback = callback
  }
  poll(flag: string) {
    this.lastPollFlag = flag
    setImmediate(() => this.callback(null, flag))
  }
}

class ErrorPollerBindings {
  fd: number
  callback: any
  lastPollFlag: string
  constructor(fd: number, callback: any) {
    this.fd = fd
    this.callback = callback
  }
  poll(flag: string) {
    this.lastPollFlag = flag
    setImmediate(() => this.callback(new Error('oh no!'), flag))
  }
}

describe('Poller', () => {
  it('constructs', () => {
    new Poller(1, MockPollerBindings)
  })
  it('can listen to the readable event', done => {
    const poller = new Poller(1, MockPollerBindings)
    poller.once('readable', err => {
      assert.equal(err, null)
      assert.equal(poller.poller.lastPollFlag, 1)
      done(err)
    })
  })
  it('can listen to the writable event', done => {
    const poller = new Poller(1, MockPollerBindings)
    poller.once('writable', err => {
      assert.equal(err, null)
      assert.equal(poller.poller.lastPollFlag, 2)
      done(err)
    })
  })
  it('can listen to the disconnect event', done => {
    const poller = new Poller(1, MockPollerBindings)
    poller.once('disconnect', err => {
      assert.equal(err, null)
      assert.equal(poller.poller.lastPollFlag, 4)
      done(err)
    })
  })
  it('reports errors on callback', done => {
    const poller = new Poller(1, ErrorPollerBindings)
    poller.once('readable', err => {
      assert.notEqual(err, null)
      done()
    })
  })
})
