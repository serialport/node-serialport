#!/usr/bin/env node

/*
serialDuplexTest.js

Tests the functionality of the serial port library.
To be used in conjunction with the Arduino sketch ArduinoEcho.ino
*/

const SerialPort = require('../')
const args = require('commander')

args
  .usage('-p <port>')
  .description('Run printable characters through the serial port')
  .option('-p, --port <port>', 'Path or Name of serial port. See serialportlist for available serial ports.')
  .parse(process.argv)

if (!args.port) {
  args.outputHelp()
  args.missingArgument('port')
  process.exit(-1)
}

const port = new SerialPort(args.port) // open the serial port:
let output = 32 // ASCII space; lowest printable character
let byteCount = 0 // number of bytes read

function onOpen() {
  console.log('Port Open')
  console.log(`Baud Rate: ${port.options.baudRate}`)
  const outString = String.fromCharCode(output)
  console.log(`Sent:\t\t${outString}`)
  port.write(outString)
}

function onData(data) {
  if (output <= 126) {
    // highest printable character: ASCII ~
    output++
  } else {
    output = 32 // lowest printable character: space
  }
  console.log(`Received:\t${data}`)
  console.log(`Read Events:\t${byteCount}`)
  byteCount++
  const outString = String.fromCharCode(output)
  port.write(outString)
  console.log(`Sent:\t\t${outString}`)
}

function onClose() {
  console.log('port closed')
  process.exit(1)
}

function onError(error) {
  console.log(`there was an error with the serial port: ${error}`)
  process.exit(1)
}

port.on('open', onOpen)
port.on('data', onData)
port.on('close', onClose)
port.on('error', onError)
