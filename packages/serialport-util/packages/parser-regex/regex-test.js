'use strict'
/* eslint-disable no-new */

const Buffer = require('safe-buffer').Buffer
const sinon = require('sinon')

const RegexParser = require('./regex')

describe('RegexParser', () => {
  it('transforms data to strings split on either carriage return or new line', () => {
    const spy = sinon.spy()
    const parser = new RegexParser({
      regex: /[\r\n]+/
    })
    parser.on('data', spy)
    parser.write(Buffer.from('I love robots\r\nEach '))
    parser.write(Buffer.from('and Every One\r'))
    parser.write(Buffer.from('even you!'))
    parser.write(Buffer.from('\nThe angry red robot'))

    assert(spy.calledThrice, 'expecting 3 data events')
    assert.deepEqual(spy.getCall(0).args[0], 'I love robots')
    assert.deepEqual(spy.getCall(1).args[0], 'Each and Every One')
    assert.deepEqual(spy.getCall(2).args[0], 'even you!')
  })

  it('flushes remaining data when the stream ends', () => {
    const parser = new RegexParser({ regex: /\n/ })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from([1]))
    assert.equal(spy.callCount, 0)
    parser.end()
    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([1]).toString())
  })

  it('throws when not provided with a regex', () => {
    assert.throws(() => {
      new RegexParser({})
    })
  })

  it('throws when called with an invalid regex expression', () => {
    assert.throws(() => {
      new RegexParser({
        regex: '\\'
      })
    })
  })

  it('allows setting of the regex with a regex string', () => {
    const spy = sinon.spy()
    const parser = new RegexParser({ regex: 'a|b' })
    parser.on('data', spy)
    parser.write('bhow are youa')
    assert(spy.calledWith('how '))
    assert(spy.calledWith('re you'))
  })

  it('allows setting of the regex with a buffer', () => {
    const parser = new RegexParser({ regex: Buffer.from('a|b') })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write('bhow are youa')
    assert(spy.calledWith('how '))
    assert(spy.calledWith('re you'))
  })

  it('allows setting of encoding', () => {
    const spy = sinon.spy()
    const parser = new RegexParser({
      regex: /\r/,
      encoding: 'hex'
    })
    parser.on('data', spy)
    parser.write(Buffer.from('a\rb\r'))
    assert.equal(spy.getCall(0).args[0], '61')
    assert.equal(spy.getCall(1).args[0], '62')
  })

  it('Works when buffer starts with regex regex', () => {
    const data = Buffer.from('\rHello\rWorld\r')
    const parser = new RegexParser({ regex: /\r/ })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(data)
    assert.equal(spy.callCount, 2)
  })

  it('should match unicode in buffer string', () => {
    const data = Buffer.from('\u000aHello\u000aWorld\u000d\u000a!')
    const parser = new RegexParser({ regex: /\r\n|\n/ })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(data)
    assert.equal(spy.callCount, 2)
  })

  it('continues looking for regexs in the next buffers', () => {
    const parser = new RegexParser({ regex: /\r\n|\n/ })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from('This could be\na poem '))
    parser.write(Buffer.from('or prose\r\nsent from a robot\r\n'))
    assert.equal(spy.callCount, 3)
    assert.deepEqual(spy.getCall(0).args[0], 'This could be')
    assert.deepEqual(spy.getCall(1).args[0], 'a poem or prose')
    assert.deepEqual(spy.getCall(2).args[0], 'sent from a robot')
  })

  it('doesn\'t emits empty data events', () => {
    const spy = sinon.spy()
    const parser = new RegexParser({ regex: /a|b/ })
    parser.on('data', spy)
    parser.write(Buffer.from('abaFab'))
    assert(spy.calledOnce)
    assert(spy.calledWith('F'))
  })
})
