'use strict'
/* eslint-disable no-new */

const Buffer = require('safe-buffer').Buffer
const sinon = require('sinon')

const DelimiterParser = require('./delimiter')

describe('DelimiterParser', () => {
  it('transforms data to strings split on a delimiter', () => {
    const spy = sinon.spy()
    const parser = new DelimiterParser({
      delimiter: Buffer.from('\n')
    })
    parser.on('data', spy)
    parser.write(Buffer.from('I love robots\nEach '))
    parser.write(Buffer.from('and Every One\n'))
    parser.write(Buffer.from('\n'))
    parser.write(Buffer.from('even you!'))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('I love robots'))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from('Each and Every One'))
    assert(spy.calledTwice)
  })

  it('includes delimiter when includeDelimiter is true', () => {
    const spy = sinon.spy()
    const parser = new DelimiterParser({
      delimiter: Buffer.from('\n'),
      includeDelimiter: true
    })
    parser.on('data', spy)
    parser.write(Buffer.from('I love robots\nEach '))
    parser.write(Buffer.from('and Every One\n'))
    parser.write(Buffer.from('\n'))
    parser.write(Buffer.from('even you!'))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('I love robots\n'))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from('Each and Every One\n'))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from('\n'))
    assert.equal(spy.callCount, 3)
  })

  it('flushes remaining data when the stream ends', () => {
    const parser = new DelimiterParser({ delimiter: Buffer.from([0]) })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from([1]))
    assert.equal(spy.callCount, 0)
    parser.end()
    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([1]))
  })

  it('throws when not provided with a delimiter', () => {
    assert.throws(() => {
      new DelimiterParser({})
    })
    assert.throws(() => {
      new DelimiterParser()
    })
  })

  it('throws when called with a 0 length delimiter', () => {
    assert.throws(() => {
      new DelimiterParser({
        delimiter: Buffer.alloc(0)
      })
    })

    assert.throws(() => {
      new DelimiterParser({
        delimiter: ''
      })
    })

    assert.throws(() => {
      new DelimiterParser({
        delimiter: []
      })
    })
  })

  it('allows setting of the delimiter with a string', () => {
    new DelimiterParser({ delimiter: 'string' })
  })

  it('allows setting of the delimiter with a buffer', () => {
    new DelimiterParser({ delimiter: Buffer.from([1]) })
  })

  it('allows setting of the delimiter with an array of bytes', () => {
    new DelimiterParser({ delimiter: [1] })
  })

  it('emits data events every time it meets 00x 00x', () => {
    const data = Buffer.from('This could be\0\0binary data\0\0sent from a Moteino\0\0')
    const parser = new DelimiterParser({ delimiter: [0, 0] })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(data)
    assert.equal(spy.callCount, 3)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('This could be'))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from('binary data'))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from('sent from a Moteino'))
  })

  it('accepts single byte delimiter', () => {
    const data = Buffer.from('This could be\0binary data\0sent from a Moteino\0')
    const parser = new DelimiterParser({ delimiter: [0] })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(data)
    assert.equal(spy.callCount, 3)
  })

  it('Works when buffer starts with delimiter', () => {
    const data = Buffer.from('\0Hello\0World\0')
    const parser = new DelimiterParser({ delimiter: Buffer.from([0]) })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(data)
    assert.equal(spy.callCount, 2)
  })

  it('should only emit if delimiters are strictly in row', () => {
    const data = Buffer.from('\0Hello\u0001World\0\0\u0001')
    const parser = new DelimiterParser({ delimiter: [0, 1] })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(data)
    assert.equal(spy.callCount, 1)
  })

  it('continues looking for delimiters in the next buffers', () => {
    const parser = new DelimiterParser({ delimiter: [0, 0] })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from('This could be\0\0binary '))
    parser.write(Buffer.from('data\0\0sent from a Moteino\0\0'))
    assert.equal(spy.callCount, 3)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('This could be'))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from('binary data'))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from('sent from a Moteino'))
  })

  it('works if a multibyte delimiter crosses a chunk boundary', () => {
    const parser = new DelimiterParser({ delimiter: Buffer.from([0, 1]) })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from([1,2,3,0]))
    parser.write(Buffer.from([1,2,3,0]))
    parser.write(Buffer.from([1]))
    assert.equal(spy.callCount, 2)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([1,2,3]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([2,3]))
  })
})
