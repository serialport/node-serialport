const childProcess = require('child_process')
const Readline = require('@serialport/parser-readline')

// get only serial port names
function checkPathOfDevice(path) {
  return /(tty(S|WCH|ACM|USB|AMA|MFD|O)|rfcomm)/.test(path) && path
}

function decodeHexEscape(str) {
  if (!str) {
    return
  }
  return str.replace(/\\x([a-fA-F0-9]{2})/g, (a, b) => {
    return String.fromCharCode(parseInt(b, 16))
  })
}

function strip0x(val) {
  if (/^0x/.test(val) && typeof val === 'string') {
    return val.substr(2)
  }
  return val
}

function extractPnpId(val) {
  if (!val) {
    return
  }
  const match = val.match(/\/by-id\/([^\s]+)/)
  return (match && match[1]) || undefined
}

function parseDevLinks(devLinks) {
  if (!devLinks) {
    return
  }
  return devLinks.split(' ').find(link => link.match(/^\/dev\/serial\/by-id\//))
}

function parsePort(text) {
  const lines = text.split('\n')
  const portData = {}

  for (const line of lines) {
    const lineType = line.slice(0, 1)
    const data = line.slice(3)

    // Check devname against a list of known good dev names for serial ports
    if (lineType === 'N') {
      if (!checkPathOfDevice(data)) {
        return
      }
    }

    // fetch key values
    if (lineType === 'E') {
      const keyValue = data.match(/^(.+)=(.*)/)
      if (!keyValue) {
        continue
      }
      portData[keyValue[1]] = keyValue[2]
    }
  }

  const path = parseDevLinks(portData.DEVLINKS) || portData.DEVNAME
  const manufacturer = decodeHexEscape(portData.ID_VENDOR_ENC)
  const serialNumber = strip0x(portData.ID_SERIAL_SHORT)
  const pnpId = extractPnpId(portData.DEVLINKS)
  const vendorId = strip0x(portData.ID_VENDOR_ID)
  const productId = strip0x(portData.ID_MODEL_ID)

  return {
    path,
    manufacturer,
    serialNumber,
    pnpId,
    vendorId,
    productId,
  }
}

async function listLinux() {
  const ports = []
  const udevadm = childProcess.spawn('udevadm', ['info', '-e'])
  const portData = udevadm.stdout.pipe(new Readline({ delimiter: '\n\n' }))
  portData.on('data', txt => {
    const port = parsePort(txt)
    if (port) {
      ports.push(port)
    }
  })

  return new Promise((resolve, reject) => {
    udevadm.once('error', reject)
    portData.once('error', reject)
    portData.once('finish', () => resolve(ports))
  })
}

module.exports = listLinux
