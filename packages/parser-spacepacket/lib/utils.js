const HEADER_LENGTH = 6

/**
 * For numbers less than 255, will ensure that their string representation is at least 8
 * characters long.
 * @param {Number} num Any number
 */
const toOctetStr = num => {
  let str = Number(num).toString(2)

  while (str.length < 8) {
    str = `0${str}`
  }

  return str
}

/**
 * Converts a Buffer of any length to an Object representation of a Space Packet header, provided
 * the received data is in the correct format.
 * @param {Buffer} buf The buffer containing the Space Packet Header Data
 */
const convertHeaderBufferToObj = buf => {
  const [byte0, byte1, byte2, byte3, byte4, byte5] = [...buf.slice(0, HEADER_LENGTH)]
  const isVersion1 = toOctetStr(byte0).indexOf('000') === 0
  const versionNumber = isVersion1 ? 1 : 'UNKNOWN_VERSION'
  const type = byte0 >>> 4
  const secondaryHeader = (byte0 >>> 3) % 2
  const zeroAndOneAsBinString = [byte0, byte1].reduce((accum, curr) => `${accum}${toOctetStr(curr)}`, '')
  const apidAsBinString = zeroAndOneAsBinString.slice(5)
  const apid = parseInt(apidAsBinString, 2)
  const byte2AsBinString = toOctetStr(byte2)
  const sequenceFlags = parseInt(byte2AsBinString.slice(0, 2), 2)
  const packetNameAsBinString = `${byte2AsBinString}${toOctetStr(byte3)}`.slice(2)
  const packetName = parseInt(packetNameAsBinString, 2)
  const packetLengthAsBinString = [byte4, byte5].reduce((accum, curr) => {
    return `${accum}${toOctetStr(curr)}`
  }, '')
  const dataLength = parseInt(packetLengthAsBinString, 2) + 1

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

module.exports = {
  HEADER_LENGTH,
  toOctetStr,
  convertHeaderBufferToObj,
}
