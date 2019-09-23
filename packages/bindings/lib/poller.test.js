const Poller = require('./poller')

class MockPollerBidnings {
  constructor(fd, callback) {
    this.fd = fd
    this.callback = callback
  }
  poll(flag) {
    this.lastPollFlag = flag
    setImmediate(() => this.callback(null, flag))
  }
}

class ErrorPollerBindings {
  constructor(fd, callback) {
    this.fd = fd
    this.callback = callback
  }
  poll(flag) {
    this.lastPollFlag = flag
    setImmediate(() => this.callback(new Error('oh no!'), flag))
  }
}

describe('Poller', () => {
  it('constructs', () => {
    new Poller(1, MockPollerBidnings)
  })
  it('can listen to the readable event', done => {
    const poller = new Poller(1, MockPollerBidnings)
    poller.once('readable', err => {
      assert.equal(err, null)
      assert.equal(poller.poller.lastPollFlag, 1)
      done(err)
    })
  })
  it('can listen to the writable event', done => {
    const poller = new Poller(1, MockPollerBidnings)
    poller.once('writable', err => {
      assert.equal(err, null)
      assert.equal(poller.poller.lastPollFlag, 2)
      done(err)
    })
  })
  it('can listen to the disconnect event', done => {
    const poller = new Poller(1, MockPollerBidnings)
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
