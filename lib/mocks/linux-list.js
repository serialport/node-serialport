// Mocks fs.read for listLinux

const EventEmitter = require('events')
const proxyquire = require('proxyquire')
const Readable = require('stream').Readable
let mockPorts
let event

proxyquire.noPreserveCache()
const listLinux = proxyquire('../linux-list', {
  child_process: {
    spawn() {
      const stream = new Readable()
      event = new EventEmitter()
      event.stdout = stream
      stream.push(mockPorts)
      stream.push(null)
      return event
    },
  },
})
proxyquire.preserveCache()

listLinux.setPorts = ports => {
  mockPorts = ports
}

listLinux.emit = () => {
  event.emit.apply(event, arguments)
}

listLinux.reset = () => {
  mockPorts = undefined
}

module.exports = listLinux
