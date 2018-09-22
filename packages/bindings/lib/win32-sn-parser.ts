const PARSERS: ReadonlyArray<RegExp> = [/USB\\(?:.+)\\(.+)/, /FTDIBUS\\(?:.+)\+(.+?)A?\\.+/]

export const serialNumParser = (pnpId: string) => {
  if (!pnpId) {
    return null
  }
  for (const parser of PARSERS) {
    const sn = pnpId.match(parser)
    if (sn) {
      return sn[1]
    }
  }
  return null
}
