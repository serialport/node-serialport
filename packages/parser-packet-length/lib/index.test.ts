import sinon from 'sinon'
import { PacketLengthParser } from './'
import { assert } from '../../../test/assert'

describe('DelimiterParser', () => {
  it('transforms data to packets of correct length starting with delimiter', () => {
    const spy = sinon.spy()
    const parser = new PacketLengthParser()
    parser.on('data', spy)
    parser.write(Buffer.from('\xaa\x0dI love robots\xaa\x13Each '))
    parser.write(Buffer.from('and Every One\n'))
    parser.write(Buffer.from([0xaa, 0x24]))
    parser.write(Buffer.from('even you!'))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.concat([Buffer.from([0xaa, 0x0d]), Buffer.from('I love robots')]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.concat([Buffer.from([0xaa, 0x13]), Buffer.from('Each and Every One\n')]))
    assert(spy.calledTwice)
  })

  it('transforms data to packets of correct length starting with delimiter when length is offset', () => {
    const spy = sinon.spy()
    const parser = new PacketLengthParser({ lengthOffset: 2, packetOverhead: 3 })
    parser.on('data', spy)
    parser.write(Buffer.from('\xaa\x01\x0dI love robots\xaa\x02\x13Each '))
    parser.write(Buffer.from('and Every One\n'))
    parser.write(Buffer.from([0xaa, 0x03, 0x24]))
    parser.write(Buffer.from('even you!'))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.concat([Buffer.from([0xaa, 0x01, 0x0d]), Buffer.from('I love robots')]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.concat([Buffer.from([0xaa, 0x02, 0x13]), Buffer.from('Each and Every One\n')]))
    assert(spy.calledTwice)
  })

  it('transforms data to packets of correct length starting with delimiter when length is offset and multibyte', () => {
    const spy = sinon.spy()
    const parser = new PacketLengthParser({ lengthOffset: 2, packetOverhead: 4, lengthBytes: 2 })
    parser.on('data', spy)
    parser.write(Buffer.from('\xaa\x01\x0d\x00I love robots\xaa\x02\x13\x00Each '))
    parser.write(Buffer.from('and Every One\n'))
    parser.write(Buffer.from([0xaa, 0x03, 0x24, 0x00]))
    parser.write(Buffer.from('even you!'))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.concat([Buffer.from([0xaa, 0x01, 0x0d, 0x00]), Buffer.from('I love robots')]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.concat([Buffer.from([0xaa, 0x02, 0x13, 0x00]), Buffer.from('Each and Every One\n')]))
    assert(spy.calledTwice)
  })

  it('flushes remaining data when the stream ends', () => {
    const spy = sinon.spy()
    const parser = new PacketLengthParser({ lengthOffset: 2, packetOverhead: 4, lengthBytes: 2 })
    parser.on('data', spy)
    parser.write(Buffer.from('\xaa\x01\x0d\x00I love robots\xaa\x02\x13\x00Each '))
    parser.write(Buffer.from('and Every One\n'))
    parser.write(Buffer.from([0xaa, 0x03, 0x24, 0x00]))
    parser.write(Buffer.from('even you!'))
    parser.end()

    assert.deepEqual(spy.getCall(0).args[0], Buffer.concat([Buffer.from([0xaa, 0x01, 0x0d, 0x00]), Buffer.from('I love robots')]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.concat([Buffer.from([0xaa, 0x02, 0x13, 0x00]), Buffer.from('Each and Every One\n')]))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.concat([Buffer.from([0xaa, 0x03, 0x24, 0x00]), Buffer.from('even you!')]))
    assert(spy.calledThrice)
  })

  it('Emits data when early when invalid length encountered', () => {
    const spy = sinon.spy()
    const parser = new PacketLengthParser({ lengthOffset: 2, packetOverhead: 4, lengthBytes: 2, maxLen: 0x0d })
    parser.on('data', spy)
    parser.write(Buffer.from('\xaa\x01\x0d\x00I love robots\xaa\x02\x13\x00Each '))
    parser.write(Buffer.from('and Every One\n'))
    parser.write(Buffer.from([0xaa, 0x03, 0x09, 0x00]))
    parser.write(Buffer.from('even you!'))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.concat([Buffer.from([0xaa, 0x01, 0x0d, 0x00]), Buffer.from('I love robots')]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0xaa, 0x02, 0x13, 0x00]))
    assert.deepEqual(spy.getCall(2).args[0], Buffer.concat([Buffer.from([0xaa, 0x03, 0x09, 0x00]), Buffer.from('even you!')]))
    assert(spy.calledThrice)
  })

  it('works if a multibyte length crosses a chunk boundary', () => {
    const spy = sinon.spy()
    const parser = new PacketLengthParser({ lengthOffset: 2, packetOverhead: 4, lengthBytes: 2 })
    parser.on('data', spy)
    parser.write(Buffer.from('\xaa\x01\x0d'))
    parser.write(Buffer.from('\x00I love robots\xaa\x02\x13\x00Each '))
    parser.write(Buffer.from('and Every One\n'))
    parser.write(Buffer.from([0xaa, 0x03, 0x24, 0x00]))
    parser.write(Buffer.from('even you!'))

    assert.deepEqual(spy.getCall(0).args[0], Buffer.concat([Buffer.from([0xaa, 0x01, 0x0d, 0x00]), Buffer.from('I love robots')]))
    assert.deepEqual(spy.getCall(1).args[0], Buffer.concat([Buffer.from([0xaa, 0x02, 0x13, 0x00]), Buffer.from('Each and Every One\n')]))
    assert(spy.calledTwice)
  })
})
