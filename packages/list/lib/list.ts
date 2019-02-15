#!/usr/bin/env node

// tslint:disable:no-console

import { Binding, PortInfo } from '@serialport/bindings'
import args from 'commander'

// tslint:disable-next-line:no-var-requires
const version = require('../package.json').version as string

args
  .version(version)
  .description('List available serial ports')
  .option('-f, --format <type>', 'Format the output as text, json, or jsonl. default: text', /^(text|json|jsonline|jsonl)$/i, 'text')
  .parse(process.argv)

type formatterName = 'text' | 'json' | 'jsonl' | 'jsonline'

function jsonl(ports: ReadonlyArray<PortInfo>) {
  ports.forEach(port => {
    console.log(JSON.stringify(port))
  })
}

const formatters = {
  text(ports: ReadonlyArray<PortInfo>) {
    ports.forEach(port => {
      console.log(`${port.path}\t${port.pnpId || ''}\t${port.manufacturer || ''}`)
    })
  },
  json(ports: ReadonlyArray<PortInfo>) {
    console.log(JSON.stringify(ports))
  },
  jsonl,
  jsonline: jsonl,
}

Binding.list().then(formatters[args.format as formatterName], (error: Error) => {
  console.error(JSON.stringify(error))
  process.exit(1)
})
