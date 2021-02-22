#!/usr/bin/env node

const bindings = require('@serialport/bindings')
const { version } = require('../package.json')
const { program, Option } = require('commander')

const formatOption = new Option('-f, --format <type>', 'Format the output').choices(['text', 'json', 'jsonline', 'jsonl']).default('text')

program.version(version).description('List available serial ports').addOption(formatOption).parse(process.argv)

function jsonl(ports) {
  ports.forEach(port => {
    console.log(JSON.stringify(port))
  })
}

const formatters = {
  text(ports) {
    ports.forEach(port => {
      console.log(`${port.path}\t${port.pnpId || ''}\t${port.manufacturer || ''}`)
    })
  },
  json(ports) {
    console.log(JSON.stringify(ports))
  },
  jsonl,
  jsonline: jsonl,
}

const args = program.opts()

bindings
  .list()
  .then(ports => {
    const formatter = formatters[args.format]
    if (!formatter) {
      throw new Error(`Invalid formatter "${args.format}"`)
    }
    formatter(ports)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
