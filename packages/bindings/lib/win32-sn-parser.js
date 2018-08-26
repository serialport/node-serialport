const PARSERS = [/USB\\(?:.+)\\(.+)/, /FTDIBUS\\(?:.+)\+(.+?)A?\\.+/]

module.exports = function(pnpId) {
  if (!pnpId) {
    return null
  }
  for (let index = 0; index < PARSERS.length; index++) {
    const parser = PARSERS[index]
    const sn = pnpId.match(parser)
    if (sn) {
      return sn[1]
    }
  }
  return null
}
