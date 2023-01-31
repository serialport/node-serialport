/* eslint-disable @typescript-eslint/no-explicit-any */
import sinon from 'sinon'
import { StartEndParser } from './'
import { assert } from '../../../test/assert'

const STX = '\x02'
const ETX = '\x03'

describe('StartEndParser', () => {
  it('transforms data to strings split on startDelimiter and endDelimiter', () => {
    const spy = sinon.spy()
    const parser = new StartEndParser({
      startDelimiter: STX,
      endDelimiter: ETX,
    })
    parser.on('data', spy)
    parser.write(Buffer.from(`${STX}I love robots${ETX}${STX}Each `))
    parser.write(Buffer.from(`and Every One${ETX}`))
    parser.write(Buffer.from(STX))
    parser.write(Buffer.from(`even you!`))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('I love robots'))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from('Each and Every One'))
    assert(spy.calledTwice)
  })

  it('includes startDelimiter when includeStartDelimiter is true', () => {
    const spy = sinon.spy()
    const parser = new StartEndParser({
      startDelimiter: STX,
      endDelimiter: ETX,
      includeStartDelimiter: true,
    })
    parser.on('data', spy)
    parser.write(Buffer.from(`${STX}I love robots${ETX}${STX}Each `))
    parser.write(Buffer.from(`and Every One${ETX}`))
    parser.write(Buffer.from(STX))
    parser.write(Buffer.from(`even you!`))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.from(`${STX}I love robots`))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from(`${STX}Each and Every One`))
    assert(spy.calledTwice)
  })

  it('includes endDelimiter when includeEndDelimiter is true', () => {
    const spy = sinon.spy()
    const parser = new StartEndParser({
      startDelimiter: STX,
      endDelimiter: ETX,
      includeEndDelimiter: true,
    })
    parser.on('data', spy)
    parser.write(Buffer.from(`${STX}I love robots${ETX}${STX}Each `))
    parser.write(Buffer.from(`and Every One${ETX}`))
    parser.write(Buffer.from(STX))
    parser.write(Buffer.from(`even you!`))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.from(`I love robots${ETX}`))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from(`Each and Every One${ETX}`))
    assert(spy.calledTwice)
  })

  it('includes both delimiters when includeStartDelimiter and includeEndDelimiter are true', () => {
    const spy = sinon.spy()
    const parser = new StartEndParser({
      startDelimiter: STX,
      endDelimiter: ETX,
      includeStartDelimiter: true,
      includeEndDelimiter: true,
    })
    parser.on('data', spy)
    parser.write(Buffer.from(`${STX}I love robots${ETX}${STX}Each `))
    parser.write(Buffer.from(`and Every One${ETX}`))
    parser.write(Buffer.from(STX))
    parser.write(Buffer.from(`even you!`))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.from(`${STX}I love robots${ETX}`))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from(`${STX}Each and Every One${ETX}`))
    assert(spy.calledTwice)
  })

  it('flushes remaining data when the stream ends', () => {
    const parser = new StartEndParser({ startDelimiter: STX, endDelimiter: ETX })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from([1]))
    assert.equal(spy.callCount, 0)
    parser.end()
    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([1]))
  })

  it('throws when not provided with a startDelimiter', () => {
    assert.throws(() => {
      new StartEndParser({ endDelimiter: ETX } as any)
    })
    assert.throws(() => {
      new (StartEndParser as any)({ endDelimiter: ETX })
    })
  })

  it('throws when not provided with an endDelimiter', () => {
    assert.throws(() => {
      new StartEndParser({ startDelimiter: STX } as any)
    })
    assert.throws(() => {
      new (StartEndParser as any)({ startDelimiter: STX })
    })
  })

  it(`throws when called with a 0 length startDelimiter`, () => {
    assert.throws(() => {
      new StartEndParser({
        startDelimiter: Buffer.alloc(0),
      } as any)
    })

    assert.throws(() => {
      new StartEndParser({
        startDelimiter: '',
      } as any)
    })

    assert.throws(() => {
      new StartEndParser({
        startDelimiter: [],
      } as any)
    })
  })

  it(`throws when called with a 0 length endDelimiter`, () => {
    assert.throws(() => {
      new StartEndParser({
        endDelimiter: Buffer.alloc(0),
      } as any)
    })

    assert.throws(() => {
      new StartEndParser({
        endDelimiter: '',
      } as any)
    })

    assert.throws(() => {
      new StartEndParser({
        endDelimiter: [],
      } as any)
    })
  })

  it(`allows setting of the startDelimiter and endDelimiter with strings`, () => {
    new StartEndParser({ startDelimiter: 'string', endDelimiter: 'string' })
  })

  it(`allows setting of the startDelimiter and endDelimiter with buffers`, () => {
    new StartEndParser({ startDelimiter: Buffer.from([1]), endDelimiter: Buffer.from([1]) })
  })

  it(`allows setting of the startDelimiter and endDelimiter with arrays of bytes`, () => {
    new StartEndParser({ startDelimiter: [1], endDelimiter: [1] })
  })

  it('Works when buffer starts with [startDelimiter, endDelimiter]', () => {
    const data = Buffer.from(`${STX}${ETX}${STX}Hello${ETX}${STX}World${ETX}`)
    const parser = new StartEndParser({ startDelimiter: STX, endDelimiter: ETX })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(data)
    assert.equal(spy.callCount, 2)
  })

  it('continues looking for delimiters in the next buffers', () => {
    const parser = new StartEndParser({ startDelimiter: STX, endDelimiter: ETX })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from(`${STX}This could be${ETX}${STX}binary `))
    parser.write(Buffer.from(`data${ETX}${STX}sent from a Moteino${ETX}`))
    assert.equal(spy.callCount, 3)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from('This could be'))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from('binary data'))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from('sent from a Moteino'))
  })

  it('works if a multibyte delimiter crosses a chunk boundary', () => {
    const parser = new StartEndParser({
      startDelimiter: [7, 7],
      endDelimiter: [8, 8],
    })
    const spy = sinon.spy()
    parser.on('data', spy)
    parser.write(Buffer.from([1, 2, 3, 7]))
    parser.write(Buffer.from([7, 2, 3, 8]))
    parser.write(Buffer.from([8]))
    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([2, 3]))
  })
})
