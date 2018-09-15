#!/usr/bin/env node

const bindings = require('@serialport/bindings')
const { version } = require('../package.json')
const args = require('commander')

args
  .version(version)
  .description('List available serial ports')
  .option('-f, --format <type>', 'Format the output as text, json, or jsonl. default: text', /^(text|json|jsonline|jsonl)$/i, 'text')
  .parse(process.argv)

function jsonl(ports) {
  ports.forEach(port => {
    console.log(JSON.stringify(port))
  })
}

const formatters = {
  text(ports) {
    ports.forEach(port => {
      console.log(`${port.comName}\t${port.pnpId || ''}\t${port.manufacturer || ''}`)
    })
  },
  json(ports) {
    console.log(JSON.stringify(ports))
  },
  jsonl,
  jsonline: jsonl,
}

bindings.list().then(formatters[args.format], err => {
  console.error(JSON.stringify(err))
  process.exit(1)
})
