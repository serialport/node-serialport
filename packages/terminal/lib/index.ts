#!/usr/bin/env node

import Enquirer from 'enquirer'
import { program } from 'commander'
import { SerialPortStream, OpenOptions } from '@serialport/stream'
import { OutputTranslator } from './output-translator'
import { autoDetect, AutoDetectTypes } from '@serialport/bindings-cpp'

const { version } = require('../package.json')
const binding = autoDetect()

const makeNumber = (input: string) => Number(input)

program
  .version(version)
  .usage('--list OR -p <port> -b <baud rate> [options...]')
  .description('A basic terminal interface for communicating over a serial port. Pressing ctrl+c exits.')
  .option('-l --list', 'List available ports then exit')
  .option('-p, --path <path>', 'Path of the serial port')
  .option('-b, --baud <baudrate>', 'Baud rate', makeNumber)
  .option('--databits <databits>', 'Data bits', makeNumber, 8)
  .option('--parity <parity>', 'Parity', 'none')
  .option('--stopbits <bits>', 'Stop bits', makeNumber, 1)
  .option('--no-echo', "Don't print characters as you type them.")
  .option('--flow-ctl <mode>', 'Enable flow control {XONOFF | RTSCTS}.')
  .parse(process.argv)

const args = program.opts<{
  list: boolean
  path?: string
  baud: number
  databits: 8 | 7 | 6 | 5
  parity: OpenOptions<AutoDetectTypes>['parity']
  stopbits: 1 | 1.5 | 2
  echo: boolean
  flowCtl?: string
}>()

const listPorts = async () => {
  const ports = await binding.list()
  for (const port of ports) {
    console.log(`${port.path}\t${port.pnpId || ''}\t${port.manufacturer || ''}`)
  }
}

const askForPort = async () => {
  const ports = await binding.list()
  if (ports.length === 0) {
    console.error('No ports detected and none specified')
    process.exit(2)
  }

  // Error in Enquirer types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const answer = await new (Enquirer as any).Select({
    name: 'serial-port-selection',
    message: 'Select a serial port to open',
    choices: ports.map((port, i) => ({
      message: `[${i + 1}] ${port.path}${port.pnpId ? ` - ${port.pnpId}` : ''}${port.manufacturer ? ` - ${port.manufacturer}` : ''}`,
      name: port.path,
    })),
    required: true,
  }).run()
  return answer as string
}

const askForBaudRate = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const baud = await new (Enquirer as any).NumberPrompt({
    name: 'baudRate-selection',
    message: 'Enter a baud rate',
    required: true,
    float: false,
    validate(input: number) {
      if (Number(input) <= 0) {
        return 'BaudRate must be a number greater than 0'
      }
      return true
    },
  }).run()
  return baud
}

const createPort = ({ path, baudRate }: { path: string; baudRate: number }) => {
  console.log(`Opening serial port: ${path} echo: ${args.echo}`)

  const openOptions: OpenOptions<AutoDetectTypes> = {
    path,
    binding,
    baudRate,
    dataBits: args.databits,
    parity: args.parity,
    stopBits: args.stopbits,
    rtscts: args.flowCtl === 'CTSRTS',
    xon: args.flowCtl === 'XONOFF',
    xoff: args.flowCtl === 'XONOFF',
  }

  const port = new SerialPortStream(openOptions)
  const output = new OutputTranslator()
  output.pipe(process.stdout)
  port.pipe(output)

  port.on('error', (err: Error) => {
    console.error('Error', err)
    process.exit(1)
  })

  port.on('close', (err?: Error) => {
    console.log('Closed', err)
    process.exit(err ? 1 : 0)
  })
  process.stdin.setRawMode(true)
  process.stdin.on('data', input => {
    for (const byte of input) {
      // ctrl+c
      if (byte === 0x03) {
        port.close()
        process.exit(0)
      }
    }
    port.write(input)
    if (args.echo) {
      output.write(input)
    }
  })
  process.stdin.resume()

  process.stdin.on('end', () => {
    port.close()
    process.exit(0)
  })
}

const run = async () => {
  if (args.list) {
    listPorts()
    return
  }
  const path = args.path || (await askForPort())
  const baudRate = Number(args.baud || (await askForBaudRate()))
  await createPort({ path, baudRate })
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
