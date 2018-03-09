'use strict'
/* eslint-disable no-new */

const Buffer = require('safe-buffer').Buffer
const sinon = require('sinon')
const CCTalkParser = require('./cctalk')

describe('CCTalkParser', () => {
  it('emits data for a default length message', () => {
    const data = Buffer.from([2, 0, 1, 254, 217])
    const spy = sinon.spy()
    const parser = new CCTalkParser()
    parser.on('data', spy)
    parser.write(data)
    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([2, 0, 1, 254, 217]))
  })

  it('emits data for a 7 byte length message', () => {
    const parser = new CCTalkParser()
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from([2, 2, 1, 254, 1, 1, 217]))
    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([2, 2, 1, 254, 1, 1, 217]))
  })

  it('emits 2 times data first length 7 secund length 5', () => {
    const parser = new CCTalkParser()
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from([2, 2, 1]))
    parser.write(Buffer.from([254, 1, 1]))
    parser.write(Buffer.from([217, 2]))
    parser.write(Buffer.from([0, 1, 254, 217]))
    assert.equal(spy.callCount, 2)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([2, 2, 1, 254, 1, 1, 217]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([2, 0, 1, 254, 217]))
  })
})
// TODO: parser.write(Buffer.from([2, 2, 1, 254, 1, 1, 217, 2, 0, 1, 254, 217, 2, 2, 1, 251, 1, 1, 217, 2, 2, 1, 252, 1, 1, 217, 2, 0, 1, 253, 217]));
