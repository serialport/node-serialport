#!/usr/bin/env node

import { promirepl } from 'promirepl'
import repl from 'repl'
import { SerialPort, SerialPortMock } from 'serialport'
import debug from 'debug'

debug.enable(process.env.DEBUG || '*')

const baudRate = Number(process.env.BAUDRATE) || 9600

// outputs the path to an arduino or nothing
async function findArduino() {
  const envPort = process.argv[2] || process.env.TEST_PORT
  if (envPort) {
    return envPort
  }
  const ports = await SerialPort.list()
  for (const port of ports) {
    if (/arduino/i.test(port.manufacturer || '')) {
      return port.path
    }
  }
  throw new Error(
    'No arduinos found. You must specify a port to load.\n\nFor example:\n\tserialport-repl COM3\n\tserialport-repl /dev/tty.my-serialport'
  )
}

findArduino()
  .then(portName => {
    console.log(`port = SerialPort("${portName}", { autoOpen: false })`)
    console.log('globals { SerialPort, SerialPortMock, portName, port }')
    const port = new SerialPort({ path: portName, baudRate, autoOpen: false })
    const spRepl = repl.start({ prompt: '> ' })
    promirepl(spRepl)
    spRepl.context.SerialPort = SerialPort
    spRepl.context.SerialPortMock = SerialPortMock
    spRepl.context.portName = portName
    spRepl.context.port = port
  })
  .catch(e => {
    console.error(e.message)
    process.exit(1)
  })
