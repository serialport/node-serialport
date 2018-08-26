// Mocks fs.read for listLinux

const EventEmitter = require('events')
const proxyquire = require('proxyquire')
const Readable = require('stream').Readable
let mockPorts

proxyquire.noPreserveCache()
const listLinux = proxyquire('../linux-list', {
  child_process: {
    spawn() {
      const event = new EventEmitter()
      const stream = new Readable()
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

listLinux.reset = () => {
  mockPorts = {}
}

module.exports = listLinux
