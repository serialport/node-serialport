'use strict'
/* eslint-disable no-new */

const Buffer = require('safe-buffer').Buffer
const sinon = require('sinon')

const ReadyParser = require('./ready')

describe('ReadyParser', () => {
  it('emits data received after the ready data', () => {
    const spy = sinon.spy()
    const parser = new ReadyParser({
      delimiter: Buffer.from('\n')
    })
    parser.on('data', spy)
    parser.write(Buffer.from('which will you get?'))
    parser.write(Buffer.from('garbage\ngold'))
    parser.write(Buffer.from('just for you'))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('gold'))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from('just for you'))
    assert(spy.calledTwice)
  })

  it('emits the ready event before the data event', () => {
    const spy = sinon.spy()
    const parser = new ReadyParser({ delimiter: '!' })
    parser.on('ready', () => {
      parser.on('data', spy)
    })
    parser.write(Buffer.from('!hi'))
    assert(spy.calledOnce)
  })

  it('has a ready property', () => {
    const parser = new ReadyParser({
      delimiter: Buffer.from('\n')
    })
    parser.resume()
    assert.isFalse(parser.ready)
    parser.write(Buffer.from('not the new line'))
    assert.isFalse(parser.ready)
    parser.write(Buffer.from('this is the \n'))
    assert.isTrue(parser.ready)
  })

  it('throws when not provided with a delimiter', () => {
    assert.throws(() => {
      new ReadyParser()
    })
    assert.throws(() => {
      new ReadyParser({})
    })
  })

  it('throws when called with a 0 length delimiter', () => {
    assert.throws(() => {
      new ReadyParser({
        delimiter: Buffer.alloc(0)
      })
    })

    assert.throws(() => {
      new ReadyParser({
        delimiter: ''
      })
    })

    assert.throws(() => {
      new ReadyParser({
        delimiter: []
      })
    })
  })

  it('allows setting of the delimiter with a string', () => {
    new ReadyParser({ delimiter: 'string' })
  })

  it('allows setting of the delimiter with a buffer', () => {
    new ReadyParser({ delimiter: Buffer.from([1]) })
  })

  it('allows setting of the delimiter with an array of bytes', () => {
    new ReadyParser({ delimiter: [1] })
  })

  it('allows receiving the delimiter over small writes', () => {
    const spy = sinon.spy()
    const parser = new ReadyParser({
      delimiter: Buffer.from('READY')
    })
    parser.on('data', spy)
    parser.write(Buffer.from('bad data then REA'))
    parser.write(Buffer.from('D'))
    parser.write(Buffer.from('Y'))
    parser.write(Buffer.from('!!!!!!'))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('!!!!!!'))
    assert(spy.calledOnce)
  })
})
