/* eslint-disable @typescript-eslint/no-unused-vars */
const { SerialPort } = require('../../')
const fs = require('fs')
const Path = require('path')

async function findArduino() {
  if (process.argv[2]) {
    return process.argv[2]
  }
  const ports = await SerialPort.list()
  for (const port of ports) {
    if (/arduino/i.test(port.manufacturer)) {
      return port.path
    }
  }
  throw new Error('No arduinos found')
}

function writeAllCommands(port) {
  console.log(`Writing ${commands.length} commands all at once`)
  commands.push('end\n')
  let outstandingWrites = 0
  commands.forEach((command, index) => {
    outstandingWrites++
    port.write(command, err => {
      outstandingWrites--
      console.log(`Done writing command #${index} Outstanding writes: ${outstandingWrites}`)
      if (err) {
        throw err
      }
    })
  })
  console.log(`Done Queuing Commands`)
  return new Promise(resolve => {
    port._parser.on('data', data => {
      if (data === 'end') {
        resolve(port)
      }
    })
  })
}

function writeOneCommandAtATime(port) {
  const command = commands.pop()
  if (!command) {
    return Promise.resolve(port)
  }
  const commandNumber = commandCount - commands.length
  return new Promise((resolve, reject) => {
    port.write(command, err => {
      console.log(`Done writing command #${commandNumber} "${command.trim()}"`)
      if (err) {
        return reject(err)
      }
      resolve(writeOneCommandAtATime(port))
    })
  })
}

async function writeAndDrain(port) {
  const command = commands.pop()
  if (!command) {
    return port
  }
  const commandNumber = commandCount - commands.length
  return new Promise((resolve, reject) => {
    port.write(command, err => {
      console.log(`Done writing command #${commandNumber} "${command.trim()}"`)
      if (err) {
        return reject(err)
      }
      port.drain(err => {
        if (err) {
          return reject(err)
        }
        resolve(writeAndDrain(port))
      })
    })
  })
}

const commands = fs
  .readFileSync(Path.join(__dirname, 'many-writes.txt'))
  .toString()
  .split('\n')
  .map(str => `${str}\n`)
const commandCount = commands.length

findArduino()
  .then(portName => {
    const port = new SerialPort(portName)
    const parser = new SerialPort.parsers.Readline({ delimiter: '\n' })
    port.pipe(parser)
    parser.on('data', data => console.log('data', data))
    port._parser = parser
    return new Promise(resolve => {
      port.on('open', () => {
        console.log('CONNECTED TO ', portName)
        resolve(port)
      })
    })
  })
  .then(port => {
    console.log('delaying 3 seconds')
    return new Promise(resolve => setTimeout(() => resolve(port), 3000))
  })
  .then(writeAllCommands) // broken?
  // .then(writeOneCommandAtATime)
  // .then(writeAndDrain)
  .then(port => {
    console.log('done!')
    port.close()
  })
