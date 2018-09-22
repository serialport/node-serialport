import childProcess from 'child_process'
import { ReadLineParser } from '@serialport/parser-readline'
import { PortInfo } from '@serialport/binding-abstract'

// get only serial port names
function checkPathOfDevice(path: string) {
  return /(tty(S|ACM|USB|AMA|MFD|O)|rfcomm)/.test(path) && path
}

function propName(name: string): string | null {
  switch (name) {
    case 'DEVNAME':
      return 'comName'
    case 'ID_VENDOR_ENC':
      return 'manufacturer'
    case 'ID_SERIAL_SHORT':
      return 'serialNumber'
    case 'ID_VENDOR_ID':
      return 'vendorId'
    case 'ID_MODEL_ID':
      return 'productId'
    case 'DEVLINKS':
      return 'pnpId'
    default:
      return null
  }
}

function decodeHexEscape(str: string) {
  return str.replace(/\\x([a-fA-F0-9]{2})/g, (a, b) => {
    return String.fromCharCode(parseInt(b, 16))
  })
}

function propVal(name: string, val: string) {
  if (name === 'pnpId') {
    const match = val.match(/\/by-id\/([^\s]+)/)
    return (match && match[1]) || undefined
  }
  if (name === 'manufacturer') {
    return decodeHexEscape(val)
  }
  if (/^0x/.test(val)) {
    return val.substr(2)
  }
  return val
}

export async function linuxList(): Promise<ReadonlyArray<PortInfo>> {
  const ports: PortInfo[] = []
  const ude = childProcess.spawn('udevadm', ['info', '-e'])
  const lines = ude.stdout.pipe(new ReadLineParser())

  let port: PortInfo | null = null
  let skipPort = false
  lines.on('data', (line: string) => {
    const lineType = line.slice(0, 1)
    const data = line.slice(3)
    // new port entry
    if (lineType === 'P') {
      port = {
        comName: '',
        manufacturer: undefined,
        serialNumber: undefined,
        pnpId: undefined,
        locationId: undefined,
        vendorId: undefined,
        productId: undefined,
      }
      skipPort = false
      return
    }

    if (skipPort) {
      return
    }

    // Check dev name and save port if it matches flag to skip the rest of the data if not
    if (lineType === 'N') {
      if (port && checkPathOfDevice(data)) {
        ports.push(port)
      } else {
        skipPort = true
      }
      return
    }

    // parse data about each port
    if (port && lineType === 'E') {
      const keyValue = data.match(/^(.+)=(.*)/)
      if (!keyValue) {
        return
      }
      const key = propName(keyValue[1].toUpperCase())
      if (!key) {
        return
      }
      port = { ...port, [key]: propVal(key, keyValue[2]) }
    }
  })

  return new Promise((resolve, reject) => {
    ude.on('error', reject)
    lines.on('error', reject)
    lines.on('finish', () => resolve(ports))
  }) as Promise<PortInfo[]>
}
