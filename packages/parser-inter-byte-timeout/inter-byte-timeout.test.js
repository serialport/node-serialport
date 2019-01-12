/* eslint-disable no-new */

const sinon = require('sinon')
const InterByteTimeoutParser = require('./inter-byte-timeout')

function wait(interval) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, interval)
    if (interval < 1) reject()
  })
}

describe('InterByteTimeoutParser', () => {
  it('emits data events after a pause of 15ms', () => {
    const spy = sinon.spy()
    const parser = new InterByteTimeoutParser({ interval: 30 })
    parser.on('data', spy)
    parser.write(Buffer.from('I love robots Each'))
    parser.write(Buffer.from('and Every One'))
    wait(30).then(() => {
      parser.write(Buffer.from('even you!'))
      parser.write(Buffer.from('The angry red robot'))
      wait(30).then(() => {
        assert(spy.calledTwice, 'expecting 2 data events')
      })
    })
  })

  it('throws wheninterval is not a number or negative', () => {
    assert.throws(() => {
      new InterByteTimeoutParser({ interval: -20 })
    })
    assert.throws(() => {
      new InterByteTimeoutParser({ interval: NaN })
    })
  })

  it('interval should default to 15ms', () => {
    const spy = sinon.spy()
    const parser = new InterByteTimeoutParser()
    parser.on('data', spy)
    parser.write(Buffer.from('I love robots Each'))
    parser.write(Buffer.from('and Every One'))
    wait(15).then(() => {
      assert(spy.calledOnce, 'expecting 1 data events')
    })
  })
})
