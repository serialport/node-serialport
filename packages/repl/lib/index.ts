#!/usr/bin/env node

import { promirepl } from 'promirepl'
import repl from 'repl'
import { SerialPort, SerialPortMock } from 'serialport'

// outputs the path to an arduino or nothing
async function findArduino() {
  const path = process.argv[2] || process.env.TEST_PORT
  const baudRate = Number(process.argv[3] || process.env.BAUDRATE) || 9600
  if (path && baudRate) {
    return { path, baudRate }
  }

  const ports = await SerialPort.list()
  for (const port of ports) {
    if (/arduino/i.test(port.manufacturer || '')) {
      return { path: port.path, baudRate }
    }
  }
  throw new Error(
    'No arduinos found. You must specify a port to load.\n\nFor example:\n\tserialport-repl COM3\n\tserialport-repl /dev/tty.my-serialport'
  )
}

findArduino()
  .then(({ path, baudRate }: { path: string; baudRate: number }) => {
    console.log(`DEBUG=${process.env.DEBUG || ''} # enable debugging with DEBUG=serialport*`)
    console.log(`port = SerialPort({ path: "${path}", baudRate: ${baudRate}, autoOpen: false })`)
    console.log('globals { SerialPort, SerialPortMock, path, port }')
    const port = new SerialPort({ path, baudRate, autoOpen: false })
    const spRepl = repl.start({ prompt: '> ' })
    promirepl(spRepl)
    spRepl.context.SerialPort = SerialPort
    spRepl.context.SerialPortMock = SerialPortMock
    spRepl.context.path = path
    spRepl.context.port = port
  })
  .catch(e => {
    console.error(e.message)
    process.exit(1)
  })
