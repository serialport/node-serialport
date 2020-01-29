#!/usr/bin/env node

const { Select } = require('enquirer')
const args = require('commander')
const SerialPort = require('@serialport/stream')
const { version } = require('../package.json')
const { OutputTranslator } = require('./output-translator')
SerialPort.Binding = require('@serialport/bindings')

const makeNumber = input => Number(input)

args
  .version(version)
  .usage('[options]')
  .description('A basic terminal interface for communicating over a serial port. Pressing ctrl+c exits.')
  .option('-l --list', 'List available ports then exit')
  .option('-p, --path <path>', 'Path of the serial port')
  .option('-b, --baud <baudrate>', 'Baud rate default: 9600', makeNumber, 9600)
  .option('--databits <databits>', 'Data bits default: 8', makeNumber, 8)
  .option('--parity <parity>', 'Parity default: none', 'none')
  .option('--stopbits <bits>', 'Stop bits default: 1', makeNumber, 1)
  .option('--no-echo', "Don't print characters as you type them.")
  .parse(process.argv)

const listPorts = async () => {
  const ports = await SerialPort.list()
  for (const port of ports) {
    console.log(`${port.path}\t${port.pnpId || ''}\t${port.manufacturer || ''}`)
  }
}

const askForPort = async () => {
  const ports = await SerialPort.list()
  if (ports.length === 0) {
    console.error('No ports detected and none specified')
    process.exit(2)
  }

  const answer = await new Select({
    name: 'serial-port-selection',
    message: 'Select a serial port to open',
    choices: ports.map((port, i) => ({
      value: `[${i + 1}]\t${port.path}\t${port.pnpId || ''}\t${port.manufacturer || ''}`,
      name: port.path,
    })),
    required: true,
  }).run()
  return answer
}

const createPort = path => {
  console.log(`Opening serial port: ${path} echo: ${args.echo}`)

  const openOptions = {
    baudRate: args.baud,
    dataBits: args.databits,
    parity: args.parity,
    stopBits: args.stopbits,
  }

  const port = new SerialPort(path, openOptions)
  const output = new OutputTranslator()
  output.pipe(process.stdout)
  port.pipe(output)

  port.on('error', err => {
    console.error('Error', err)
    process.exit(1)
  })

  port.on('close', err => {
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
  await createPort(path)
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
