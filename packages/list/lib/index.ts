#!/usr/bin/env node

import { autoDetect, PortInfo } from '@serialport/bindings-cpp'
import { program, Option } from 'commander'

const { version } = require('../package.json')

const formatOption = new Option('-f, --format <type>', 'Format the output').choices(['text', 'json', 'jsonline', 'jsonl']).default('text')

program.version(version).description('List available serial ports').addOption(formatOption).parse(process.argv)

function jsonl(ports: PortInfo[]) {
  ports.forEach(port => {
    console.log(JSON.stringify(port))
  })
}

const formatters: Record<string, undefined | ((ports: PortInfo[]) => void)> = {
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

const args = program.opts<{
  format: 'text' | 'json' | 'jsonline' | 'jsonl'
}>()

autoDetect()
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
