import sinon from 'sinon'
import { SlipEncoder } from './encoder'
import { assert } from '../../../test/assert'

describe('SlipEncoder', () => {
  it('Adds one delimiter to one-byte messages', () => {
    const spy = sinon.spy()
    const encoder = new SlipEncoder()
    encoder.on('data', spy)

    encoder.write(Buffer.from([0x01]))
    encoder.write(Buffer.from([0x80]))
    encoder.write(Buffer.from([0xff]))
    encoder.write(Buffer.from([0xa5]))

    assert.equal(spy.callCount, 4)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01, 0xc0]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0x80, 0xc0]))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xff, 0xc0]))
    assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xa5, 0xc0]))
  })

  it('Adds two delimiters to one-byte messages with the bluetooth quirk', () => {
    const spy = sinon.spy()
    const encoder = new SlipEncoder({ bluetoothQuirk: true })
    encoder.on('data', spy)

    encoder.write(Buffer.from([0x01]))
    encoder.write(Buffer.from([0x80]))
    encoder.write(Buffer.from([0xff]))
    encoder.write(Buffer.from([0xa5]))

    assert.equal(spy.callCount, 4)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0xc0, 0x01, 0xc0]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0xc0, 0x80, 0xc0]))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xc0, 0xff, 0xc0]))
    assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xc0, 0xa5, 0xc0]))
  })

  it('Adds one delimiter to zero-byte messages', () => {
    const spy = sinon.spy()
    const encoder = new SlipEncoder()
    encoder.on('data', spy)

    encoder.write(Buffer.from([]))

    assert.equal(spy.callCount, 1)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0xc0]))
  })

  it('Does nothing with zero-byte messages with the bluetooth quirk', () => {
    const spy = sinon.spy()

    const encoder = new SlipEncoder({ bluetoothQuirk: true })

    encoder.on('data', spy)

    encoder.write(Buffer.from([]))
    encoder.write(Buffer.from([]))
    encoder.write(Buffer.from([]))
    encoder.write(Buffer.from([]))

    assert.equal(spy.callCount, 0)
  })

  it('Escapes characters', () => {
    const spy = sinon.spy()
    const encoder = new SlipEncoder()
    encoder.on('data', spy)

    encoder.write(Buffer.from([0x01]))
    encoder.write(Buffer.from([0xc0]))
    encoder.write(Buffer.from([0xdb]))
    encoder.write(Buffer.from([0xdc]))
    encoder.write(Buffer.from([0xdd]))
    encoder.write(Buffer.from([0xff]))

    assert.equal(spy.callCount, 6)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01, 0xc0]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0xdb, 0xdc, 0xc0]))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xdb, 0xdd, 0xc0]))
    assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xdc, 0xc0]))
    assert.deepEqual(spy.getCall(4).args[0], Buffer.from([0xdd, 0xc0]))
    assert.deepEqual(spy.getCall(5).args[0], Buffer.from([0xff, 0xc0]))
  })

  it('Escapes characters with custom escapes', () => {
    const spy = sinon.spy()
    const slip = {
      START: 0xab,
      ESC: 0xcd,
      END: 0xbc,

      ESC_START: 0xac,
      ESC_ESC: 0xce,
      ESC_END: 0xbd,
    }
    const encoder = new SlipEncoder(slip)
    encoder.on('data', spy)

    encoder.write(Buffer.from([0x01]))
    encoder.write(Buffer.from([0xbc]))
    encoder.write(Buffer.from([0xcd]))
    encoder.write(Buffer.from([0xdc]))
    encoder.write(Buffer.from([0xdd]))
    encoder.write(Buffer.from([0xff]))
    encoder.write(Buffer.from([0xab]))

    assert.equal(spy.callCount, 7)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0xab, 0x01, 0xbc]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0xab, 0xcd, 0xbd, 0xbc]))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xab, 0xcd, 0xce, 0xbc]))
    assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xab, 0xdc, 0xbc]))
    assert.deepEqual(spy.getCall(4).args[0], Buffer.from([0xab, 0xdd, 0xbc]))
    assert.deepEqual(spy.getCall(5).args[0], Buffer.from([0xab, 0xff, 0xbc]))
    assert.deepEqual(spy.getCall(6).args[0], Buffer.from([0xab, 0xcd, 0xac, 0xbc]))
  })

  it('Escapes characters with the bluetooth quirk', () => {
    const spy = sinon.spy()
    const encoder = new SlipEncoder({ bluetoothQuirk: true })
    encoder.on('data', spy)

    encoder.write(Buffer.from([0x01]))
    encoder.write(Buffer.from([0xc0]))
    encoder.write(Buffer.from([0xdb]))
    encoder.write(Buffer.from([0xdc]))
    encoder.write(Buffer.from([0xdd]))
    encoder.write(Buffer.from([0xff]))

    assert.equal(spy.callCount, 6)
    assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0xc0, 0x01, 0xc0]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0xc0, 0xdb, 0xdc, 0xc0]))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xc0, 0xdb, 0xdd, 0xc0]))
    assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xc0, 0xdc, 0xc0]))
    assert.deepEqual(spy.getCall(4).args[0], Buffer.from([0xc0, 0xdd, 0xc0]))
    assert.deepEqual(spy.getCall(5).args[0], Buffer.from([0xc0, 0xff, 0xc0]))
  })
})
