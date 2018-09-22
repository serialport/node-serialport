#!/usr/bin/env node

// tslint:disable:no-console

import SerialPort from 'serialport'
import args from 'commander'
import PromptList from 'prompt-list'

// tslint:disable-next-line:no-var-requires
const version = require('../package.json').version as string

function makeNumber(input: any) {
  return Number(input)
}

args
  .version(version)
  .usage('[options]')
  .description('A basic terminal interface for communicating over a serial port. Pressing ctrl+c exits.')
  .option('-l --list', 'List available ports then exit')
  .option('-p, --port <port>', 'Path or Name of serial port')
  .option('-b, --baud <baudrate>', 'Baud rate default: 9600', makeNumber, 9600)
  .option('--databits <databits>', 'Data bits default: 8', makeNumber, 8)
  .option('--parity <parity>', 'Parity default: none', 'none')
  .option('--stopbits <bits>', 'Stop bits default: 1', makeNumber, 1)
  // TODO make this on by default
  .option('--echo --localecho', 'Print characters as you type them.')
  .parse(process.argv)

function logErrorAndExit(error: Error) {
  console.error(error)
  process.exit(1)
}

// not needed once bindings is typescript
interface Port {
  readonly comName: string
  readonly manufacturer?: string
  readonly pnpId?: string
}

function listPorts() {
  SerialPort.list().then(
    (ports: Port[]) => {
      ports.forEach(port => {
        console.log(`${port.comName}\t${port.pnpId || ''}\t${port.manufacturer || ''}`)
      })
    },
    (err: Error) => {
      console.error('Error listing ports', err)
    }
  )
}

function askForPort() {
  return SerialPort.list().then((ports: Port[]) => {
    if (ports.length === 0) {
      console.error('No ports detected and none specified')
      process.exit(2)
    }

    const portSelection = new PromptList({
      name: 'serial-port-selection',
      message: 'Select a serial port to open',
      choices: ports.map((port, i) => ({
        value: `[${i + 1}]\t${port.comName}\t${port.pnpId || ''}\t${port.manufacturer || ''}`,
        name: port.comName,
      })),
      validate: Boolean, // ensure we picked something
    })

    return portSelection.run().then((answer: string) => {
      console.log(`Opening serial port: ${answer}`)
      return answer
    })
  })
}

function createPort(selectedPort: string) {
  const openOptions = {
    baudRate: args.baud,
    dataBits: args.databits,
    parity: args.parity,
    stopBits: args.stopbits,
  }

  const port = new SerialPort(selectedPort, openOptions)

  process.stdin.resume()
  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true)
  }
  process.stdin.on('data', s => {
    if (s[0] === 0x03) {
      port.close()
      process.exit(0)
    }
    if (args.localecho) {
      if (s[0] === 0x0d) {
        process.stdout.write('\n')
      } else {
        process.stdout.write(s)
      }
    }
    port.write(s)
  })

  port.on('data', (data: Buffer) => {
    process.stdout.write(data.toString())
  })

  port.on('error', (err: Error) => {
    console.log('Error', err)
    process.exit(1)
  })

  port.on('close', (err: Error) => {
    console.log('Closed', err)
    process.exit(err ? 1 : 0)
  })
}

if (args.list) {
  listPorts()
} else {
  Promise.resolve(args.port || askForPort())
    .then(createPort)
    .catch(logErrorAndExit)
}
