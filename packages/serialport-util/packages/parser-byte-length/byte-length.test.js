'use strict'
/* eslint-disable no-new */

const Buffer = require('safe-buffer').Buffer
const sinon = require('sinon')
const ByteLengthParser = require('./byte-length')

describe('ByteLengthParser', () => {
  it('emits data events every 8 bytes', () => {
    const data = Buffer.from('Robots are so freaking cool!')
    const spy = sinon.spy()
    const parser = new ByteLengthParser({ length: 8 })
    parser.on('data', spy)
    parser.write(data)
    assert.equal(spy.callCount, 3)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('Robots a'))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from('re so fr'))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from('eaking c'))
  })

  it('throws when not provided with a length', () => {
    assert.throws(() => {
      new ByteLengthParser()
    })
    assert.throws(() => {
      new ByteLengthParser({})
    })
  })

  it('throws when length is zero', () => {
    assert.throws(() => {
      new ByteLengthParser({
        length: 0
      })
    })
  })

  it('throws when called with a non numeric length', () => {
    assert.throws(() => {
      new ByteLengthParser({
        length: 'foop'
      })
    })
  })

  it('continues looking for bytes in additional writes', () => {
    const parser = new ByteLengthParser({ length: 4 })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from('ab'))
    parser.write(Buffer.from('cd'))
    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('abcd'))
  })

  it('flushes remaining data when the stream ends', () => {
    const parser = new ByteLengthParser({ length: 4 })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from('12'))
    assert.equal(spy.callCount, 0)
    parser.end()
    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('12'))
  })
})
