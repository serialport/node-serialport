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

module.exports = {
  HEADER_LENGTH,
  toOctetStr,
  convertHeaderBufferToObj,
}
