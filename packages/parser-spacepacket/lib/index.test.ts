import { expect } from 'chai'
import sinon from 'sinon'
import { SpacePacketParser } from './'

const VERSION = '000'
const TYPE = '0'
const SECONDARY_HEADER = '1'
const NO_SECONDARY_HEADER = '0'
const API_ID = '10010010011'
const UNSEGMENTED = '11'
const COUNT = '00000000000001'
const DATA_LENGTH = '0000000000000101'
const DATA_LENGTH_WITH_2ARY_HEADER = '0000000000010001'

const buildSixCharacterBasicSpacePacket = (text: string) => {
  const data = text.slice(0, 6)
  const baseArray = []
  let headerAsString = `${VERSION}${TYPE}${NO_SECONDARY_HEADER}${API_ID}${UNSEGMENTED}${COUNT}${DATA_LENGTH}`

  while (headerAsString.length) {
    const next = headerAsString.slice(0, 8)

    baseArray.push(parseInt(next, 2))
    headerAsString = headerAsString.slice(8)
  }

  return {
    buffer: Buffer.concat([Buffer.from(baseArray), Buffer.from(data)]),
    expected: {
      header: {
        versionNumber: 1,
        identification: {
          apid: parseInt(API_ID, 2),
          secondaryHeader: 0,
          type: 0,
        },
        sequenceControl: {
          packetName: parseInt(COUNT, 2),
          sequenceFlags: 3,
        },
        dataLength: 6,
      },
      data,
    },
  }
}

const buildSixCharacterBasicSpacePacketWithSecondaryHeaderLength6 = (text: string) => {
  const data = text.slice(0, 6)
  const baseArray = []
  const TIMECO = 'TIMECO'
  const ANCILL = 'ANCILL'
  const dataBuffer = Buffer.concat([Buffer.from(TIMECO), Buffer.from(ANCILL), Buffer.from(data)])
  let headerAsString = `${VERSION}${TYPE}${SECONDARY_HEADER}${API_ID}${UNSEGMENTED}${COUNT}${DATA_LENGTH_WITH_2ARY_HEADER}`

  while (headerAsString.length) {
    const next = headerAsString.slice(0, 8)

    baseArray.push(parseInt(next, 2))
    headerAsString = headerAsString.slice(8)
  }

  return {
    buffer: Buffer.concat([Buffer.from(baseArray), dataBuffer]),
    expected: {
      header: {
        versionNumber: 1,
        identification: {
          apid: parseInt(API_ID, 2),
          secondaryHeader: 1,
          type: 0,
        },
        sequenceControl: {
          packetName: parseInt(COUNT, 2),
          sequenceFlags: 3,
        },
        dataLength: 18,
      },
      secondaryHeader: {
        timeCode: TIMECO,
        ancillaryData: ANCILL,
      },
      data,
    },
  }
}

describe('SpacePacketParser', () => {
  it('handles a complete space packet buffer sent at once', () => {
    const test = new SpacePacketParser()
    const { buffer, expected } = buildSixCharacterBasicSpacePacket('123456')

    test.on('data', data => {
      expect(data).to.deep.equal(expected)
    })

    test.write(buffer)
  })

  it('flushes a partial packet if end is called', () => {
    const test = new SpacePacketParser()
    const { buffer } = buildSixCharacterBasicSpacePacket('things')

    test.on('data', data => {
      expect(data.length).to.equal(4)
    })

    test.write(buffer.slice(0, 4))

    test.end()
  })

  it('handles receiving two space packets at the same time', () => {
    const test = new SpacePacketParser()
    const { buffer, expected } = buildSixCharacterBasicSpacePacket('first1')
    const { buffer: buff2, expected: expect2 } = buildSixCharacterBasicSpacePacket('second')
    const dataCallbackSpy = sinon.stub()

    test.on('data', dataCallbackSpy)
    test.write(Buffer.concat([buffer, buff2]))

    expect(dataCallbackSpy.callCount).to.equal(2)
    sinon.assert.calledWith(dataCallbackSpy.getCall(0), expected)
    sinon.assert.calledWith(dataCallbackSpy.getCall(1), expect2)
  })

  it('handles receiving parts of a space packet in chunks', () => {
    const test = new SpacePacketParser()
    const { buffer, expected } = buildSixCharacterBasicSpacePacket('partsy')
    const dataCallbackSpy = sinon.stub()

    test.on('data', dataCallbackSpy)

    for (let i = 0; i < buffer.length; i++) {
      test.write(Buffer.from([buffer[i]]))
    }

    expect(dataCallbackSpy.callCount).to.equal(1)
    sinon.assert.calledWith(dataCallbackSpy, expected)
  })

  it('handles receiving a complete plus a partial packet at once', () => {
    const test = new SpacePacketParser()
    const { buffer, expected } = buildSixCharacterBasicSpacePacket('part_1')
    const { buffer: buff2 } = buildSixCharacterBasicSpacePacket('part_2')
    const onePoint5ishPackets = Buffer.concat([buffer, buff2]).slice(0, 16)
    const dataCallbackSpy = sinon.stub()

    test.on('data', dataCallbackSpy)

    test.write(onePoint5ishPackets)

    expect(dataCallbackSpy.callCount).to.equal(1)
    sinon.assert.calledWith(dataCallbackSpy, expected)
  })

  it('includes timeCode and ancillaryData fields in a secondary header object', () => {
    const test = new SpacePacketParser({ timeCodeFieldLength: 6, ancillaryDataFieldLength: 6 })
    const { buffer, expected } = buildSixCharacterBasicSpacePacketWithSecondaryHeaderLength6('123456')

    test.on('data', data => {
      expect(data).to.deep.equal(expected)
    })

    test.write(buffer)
  })
})
