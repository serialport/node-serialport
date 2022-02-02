export const HEADER_LENGTH = 6

/**
 * For numbers less than 255, will ensure that their string representation is at least 8 characters long.
 */
const toOctetStr = (num: number) => {
  let str = Number(num).toString(2)

  while (str.length < 8) {
    str = `0${str}`
  }

  return str
}

export interface SpacePacketHeader {
  versionNumber: string | number
  identification: {
    apid: number
    secondaryHeader: number
    type: number
  }
  sequenceControl: {
    packetName: number
    sequenceFlags: number
  }
  dataLength: number
}

export interface SpacePacket {
  header: SpacePacketHeader
  secondaryHeader?: {
    timeCode?: string
    ancillaryData?: string
  }
  data: string
}

/**
 * Converts a Buffer of any length to an Object representation of a Space Packet header, provided
 * the received data is in the correct format.
 * @param buf - The buffer containing the Space Packet Header Data
 */
export const convertHeaderBufferToObj = (buf: Buffer): SpacePacketHeader => {
  const headerStr = Array.from(buf.slice(0, HEADER_LENGTH)).reduce((accum, curr) => `${accum}${toOctetStr(curr)}`, '')
  const isVersion1 = headerStr.slice(0, 3) === '000'
  const versionNumber = isVersion1 ? 1 : 'UNKNOWN_VERSION'
  const type = Number(headerStr[3])
  const secondaryHeader = Number(headerStr[4])
  const apid = parseInt(headerStr.slice(5, 16), 2)
  const sequenceFlags = parseInt(headerStr.slice(16, 18), 2)
  const packetName = parseInt(headerStr.slice(18, 32), 2)
  const dataLength = parseInt(headerStr.slice(-16), 2) + 1

  return {
    versionNumber,
    identification: {
      apid,
      secondaryHeader,
      type,
    },
    sequenceControl: {
      packetName,
      sequenceFlags,
    },
    dataLength,
  }
}
