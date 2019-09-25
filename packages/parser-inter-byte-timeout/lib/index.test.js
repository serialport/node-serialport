/* eslint-disable no-new */

const sinon = require('sinon')
const InterByteTimeoutParser = require('../')

function wait(interval) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, interval)
    if (interval < 1) reject()
  })
}

describe('InterByteTimeoutParser', () => {
  it('emits data events after a pause of 30ms', () => {
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

  it('throws when interval is not a number or negative', () => {
    assert.throws(() => {
      new InterByteTimeoutParser({ interval: -20 })
    })
    assert.throws(() => {
      new InterByteTimeoutParser({ interval: NaN })
    })
    assert.throws(() => {
      new InterByteTimeoutParser({ interval: 'hello' })
    })
    assert.throws(() => {
      new InterByteTimeoutParser()
    })
  })

  it('throws when maxBufferSize is not a number or negative', () => {
    assert.throws(() => {
      new InterByteTimeoutParser({ maxBufferSize: -20, interval: 15 })
    })
    assert.throws(() => {
      new InterByteTimeoutParser({ maxBufferSize: NaN, interval: 15 })
    })
    assert.throws(() => {
      new InterByteTimeoutParser({ maxBufferSize: 'hello', interval: 15 })
    })
  })

  it('emits data events when buffer is full', () => {
    const spy = sinon.spy()
    const parser = new InterByteTimeoutParser({ maxBufferSize: 2, interval: 15 })
    parser.on('data', spy)
    parser.write(Buffer.from([1, 2, 3, 4, 5, 6]))
    wait(15).then(() => {
      assert(spy.calledThrice, 'expecting 3 data events')
    })
  })

  it('emits all buffered data when stream ends', () => {
    const spy = sinon.spy()
    const parser = new InterByteTimeoutParser({ interval: 15 })
    parser.on('data', spy)
    parser.write('Oh wow.')
    parser.end()
    assert(spy.calledOnce, 'expecting 1 data event')
  })
  it('handles not having any buffered data when stream ends', () => {
    const spy = sinon.spy()
    const parser = new InterByteTimeoutParser({ interval: 15 })
    parser.on('data', spy)
    parser.write('')
    parser.end()
    assert(spy.notCalled, 'expecting no data events')
  })
})
