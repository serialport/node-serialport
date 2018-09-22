#!/usr/bin/env node

// tslint:disable:no-console

import { bindings } from '@serialport/bindings'
import args from 'commander'

// tslint:disable-next-line:no-var-requires
const version = require('../package.json').version as string

args
  .version(version)
  .description('List available serial ports')
  .option('-f, --format <type>', 'Format the output as text, json, or jsonl. default: text', /^(text|json|jsonline|jsonl)$/i, 'text')
  .parse(process.argv)

type formatterName = 'text' | 'json' | 'jsonl' | 'jsonline'

// not needed once bindings is typescript
interface Port {
  readonly comName: string
  readonly manufacturer?: string
  readonly pnpId?: string
}

function jsonl(ports: ReadonlyArray<Port>) {
  ports.forEach(port => {
    console.log(JSON.stringify(port))
  })
}

const formatters = {
  text(ports: ReadonlyArray<Port>) {
    ports.forEach(port => {
      console.log(`${port.comName}\t${port.pnpId || ''}\t${port.manufacturer || ''}`)
    })
  },
  json(ports: ReadonlyArray<Port>) {
    console.log(JSON.stringify(ports))
  },
  jsonl,
  jsonline: jsonl,
}

bindings.list().then(formatters[args.format as formatterName], (error: Error) => {
  console.error(JSON.stringify(error))
  process.exit(1)
})
