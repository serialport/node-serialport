/* eslint-disable no-new */

const sinon = require('sinon')

const SlipEncoder = require('./slip-encoder')

describe('SlipEncoderParser', () => {
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
