#!/usr/bin/env node

const serialport = require('../')
const version = require('../package.json').version
const args = require('commander')

args
  .version(version)
  .description('List available serial ports')
  .option(
    '-f, --format <type>',
    'Format the output as text, json, or jsonline. default: text',
    /^(text|json|jsonline)$/i,
    'text'
  )
  .parse(process.argv)

const formatters = {
  text(err, ports) {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    ports.forEach(port => {
      console.log(
        `${port.comName}\t${port.pnpId || ''}\t${port.manufacturer || ''}`
      )
    })
  },
  json(err, ports) {
    if (err) {
      console.error(JSON.stringify(err))
      process.exit(1)
    }
    console.log(JSON.stringify(ports))
  },
  jsonline(err, ports) {
    if (err) {
      console.error(JSON.stringify(err))
      process.exit(1)
    }
    ports.forEach(port => {
      console.log(JSON.stringify(port))
    })
  },
}

serialport.list(formatters[args.format])
