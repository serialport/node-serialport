import sinon from 'sinon'
import { SlipDecoder } from './decoder'
import { assert } from '../../../test/assert'

describe('SlipDecoder', () => {
  it('Decodes one-byte messages', () => {
    const spy = sinon.spy()
    const decoder = new SlipDecoder()
    decoder.on('data', spy)

    decoder.write(Buffer.from([0x01, 0xc0]))
    decoder.write(Buffer.from([0x80, 0xc0]))
    decoder.write(Buffer.from([0xff, 0xc0]))
    decoder.write(Buffer.from([0xa5, 0xc0]))

    assert.equal(spy.callCount, 4)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0x80]))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xff]))
    assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xa5]))
  })

  it('No data event on zero-byte messages', () => {
    const spy = sinon.spy()
    const decoder = new SlipDecoder()
    decoder.on('data', spy)

    decoder.write(Buffer.from([0xc0]))

    assert.equal(spy.callCount, 0)
  })

  it('Decodes Escaped characters', () => {
    const spy = sinon.spy()
    const decoder = new SlipDecoder()
    decoder.on('data', spy)

    decoder.write(Buffer.from([0x01, 0xc0]))
    decoder.write(Buffer.from([0xdb, 0xdc, 0xc0]))
    decoder.write(Buffer.from([0xdb, 0xdd, 0xc0]))
    decoder.write(Buffer.from([0xdc, 0xc0]))
    decoder.write(Buffer.from([0xdd, 0xc0]))
    decoder.write(Buffer.from([0xff, 0xc0]))

    assert.equal(spy.callCount, 6)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0xc0]))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xdb]))
    assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xdc]))
    assert.deepEqual(spy.getCall(4).args[0], Buffer.from([0xdd]))
    assert.deepEqual(spy.getCall(5).args[0], Buffer.from([0xff]))
  })

  it('Decodes Escaped characters with custom escapes', () => {
    const spy = sinon.spy()
    const slip = {
      START: 0xab,
      ESC: 0xcd,
      END: 0xbc,

      ESC_START: 0xac,
      ESC_ESC: 0xce,
      ESC_END: 0xbd,
    }
    const decoder = new SlipDecoder(slip)
    decoder.on('data', spy)

    decoder.write(Buffer.from([0xab, 0x01, 0xbc]))
    decoder.write(Buffer.from([0xab, 0xcd, 0xbd, 0xbc]))
    decoder.write(Buffer.from([0xab, 0xcd, 0xce, 0xbc]))
    decoder.write(Buffer.from([0xab, 0xdc, 0xbc]))
    decoder.write(Buffer.from([0xab, 0xdd, 0xbc]))
    decoder.write(Buffer.from([0xab, 0xff, 0xbc]))
    decoder.write(Buffer.from([0xab, 0xcd, 0xac, 0xbc]))

    assert.equal(spy.callCount, 7)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0xbc]))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xcd]))
    assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xdc]))
    assert.deepEqual(spy.getCall(4).args[0], Buffer.from([0xdd]))
    assert.deepEqual(spy.getCall(5).args[0], Buffer.from([0xff]))
    assert.deepEqual(spy.getCall(6).args[0], Buffer.from([0xab]))
  })

  it('Decodes invalid escape', () => {
    const spy = sinon.spy()
    const slip = {
      START: 0xab,
      ESC: 0xcd,
      END: 0xbc,

      ESC_START: 0xac,
      ESC_ESC: 0xce,
      ESC_END: 0xbd,
    }
    const decoder = new SlipDecoder(slip)
    decoder.on('data', spy)

    decoder.write(Buffer.from([0xab, 0x01, 0xcd, 0x02, 0xbc]))

    assert.equal(spy.callCount, 2)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0x02]))
  })

  it('Decodes data split across multiple chunks', () => {
    const spy = sinon.spy()
    const slip = {
      START: 0xab,
      ESC: 0xcd,
      END: 0xbc,

      ESC_START: 0xac,
      ESC_ESC: 0xce,
      ESC_END: 0xbd,
    }
    const decoder = new SlipDecoder(slip)
    decoder.on('data', spy)

    decoder.write(Buffer.from([0xab, 0x01]))
    decoder.write(Buffer.from([0xcd, 0xbd, 0xbc]))

    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01, 0xbc]))
  })

  it('Decodes data split across multiple chunks on escape', () => {
    const spy = sinon.spy()
    const slip = {
      START: 0xab,
      ESC: 0xcd,
      END: 0xbc,

      ESC_START: 0xac,
      ESC_ESC: 0xce,
      ESC_END: 0xbd,
    }
    const decoder = new SlipDecoder(slip)
    decoder.on('data', spy)

    decoder.write(Buffer.from([0xab, 0x01, 0xcd]))
    decoder.write(Buffer.from([0xbd, 0xbc]))

    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01, 0xbc]))
  })

  it('Data before start is dropped', () => {
    const spy = sinon.spy()
    const slip = {
      START: 0xab,
      END: 0xbc,
    }
    const decoder = new SlipDecoder(slip)
    decoder.on('data', spy)

    decoder.write(Buffer.from([0x01, 0x02, 0xdb]))
    decoder.write(Buffer.from([0xab, 0x03, 0x04, 0xbc]))

    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x03, 0x04]))
  })

  it('Flushes pending data on stream end', () => {
    const spy = sinon.spy()
    const slip = {
      START: 0xab,
      ESC: 0xcd,
      END: 0xbc,

      ESC_START: 0xac,
      ESC_ESC: 0xce,
      ESC_END: 0xbd,
    }
    const decoder = new SlipDecoder(slip)
    decoder.on('data', spy)

    decoder.write(Buffer.from([0xab, 0x01, 0xcd]))
    decoder.end()

    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01]))
  })
})
