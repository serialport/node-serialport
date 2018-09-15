const chai = require('chai')
const sinon = require('sinon')
chai.use(require('chai-subset'))
const assert = chai.assert

const SerialPort = require('./stream')
const MockBinding = require('@serialport/binding-mock')

describe('SerialPort', () => {
  let sandbox

  beforeEach(() => {
    SerialPort.Binding = MockBinding
    sandbox = sinon.createSandbox()
    MockBinding.createPort('/dev/exists', {
      echo: true,
      readyData: Buffer.from([]),
    })
  })

  afterEach(() => {
    sandbox.restore()
    MockBinding.reset()
  })

  describe('constructor', () => {
    it('provides auto construction', function(done) {
      const serialPort = SerialPort
      this.port = serialPort('/dev/exists', done)
    })

    describe('autoOpen', () => {
      it('opens the port automatically', function(done) {
        this.port = new SerialPort('/dev/exists', err => {
          assert.isNull(err)
          done()
        })
      })

      it('emits the open event', done => {
        const port = new SerialPort('/dev/exists')
        port.on('open', done)
      })

      it("doesn't open if told not to", done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        port.on('open', () => {
          throw new Error("this shouldn't be opening")
        })
        process.nextTick(done)
      })
    })

    // needs to be passes the callback to open
    it('passes the error to the callback when an bad port is provided', function(done) {
      this.port = new SerialPort('/bad/port', err => {
        assert.instanceOf(err, Error)
        done()
      })
    })

    // is this a test for open?
    it('emits an error when an bad port is provided', done => {
      const port = new SerialPort('/bad/port')
      port.once('error', err => {
        assert.instanceOf(err, Error)
        done()
      })
    })

    it('throws an error when bindings are missing', function(done) {
      SerialPort.Binding = undefined
      try {
        this.port = new SerialPort('/dev/exists')
      } catch (err) {
        assert.instanceOf(err, Error)
        done()
      }
    })

    it('throws an error when no port is provided', function(done) {
      try {
        this.port = new SerialPort('')
      } catch (err) {
        assert.instanceOf(err, Error)
        done()
      }
    })

    it('throws an error when given bad options even with a callback', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { baudRate: 'whatever' }, () => {})
      } catch (err) {
        assert.instanceOf(err, Error)
        done()
      }
    })

    it('throws an error when given bad baudrate even with a callback', function() {
      assert.throws(() => {
        this.port = new SerialPort('/dev/exists', { baudrate: 9600 }, () => {})
      })
    })

    it('errors with a non number baudRate', function(done) {
      try {
        this.port = new SerialPort('/bad/port', { baudRate: 'whatever' })
      } catch (err) {
        assert.instanceOf(err, Error)
        done()
      }
    })

    it('errors with invalid databits', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { dataBits: 19 })
      } catch (err) {
        assert.instanceOf(err, Error)
        done()
      }
    })

    it('errors with invalid stopbits', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { stopBits: 19 })
      } catch (err) {
        assert.instanceOf(err, Error)
        done()
      }
    })

    it('errors with invalid parity', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { parity: 'pumpkins' })
      } catch (err) {
        assert.instanceOf(err, Error)
        done()
      }
    })

    it('errors with invalid flow control', function(done) {
      try {
        this.port = new SerialPort('/dev/exists', { xon: 'pumpkins' })
      } catch (err) {
        assert.instanceOf(err, Error)
        done()
      }
    })

    it('sets valid flow control individually', done => {
      const options = {
        xon: true,
        xoff: true,
        xany: true,
        rtscts: true,
        autoOpen: false,
      }
      const port = new SerialPort('/dev/exists', options)
      assert.isTrue(port.settings.xon)
      assert.isTrue(port.settings.xoff)
      assert.isTrue(port.settings.xany)
      assert.isTrue(port.settings.rtscts)
      done()
    })

    it('allows optional options', function(done) {
      this.port = new SerialPort('/dev/exists', done)
    })
  })

  describe('static methods', () => {
    it('calls to the bindings', done => {
      const spy = sinon.spy(MockBinding, 'list')
      SerialPort.list((err, ports) => {
        assert.isNull(err)
        assert.isArray(ports)
        assert(spy.calledOnce)
        done()
      })
    })

    it('errors if there are no bindings', done => {
      SerialPort.Binding = null
      try {
        SerialPort.list(() => {})
      } catch (e) {
        assert.instanceOf(e, TypeError)
        done()
      }
    })
  })

  describe('property', () => {
    describe('.baudRate', () => {
      it('is a read only property set during construction', () => {
        const port = new SerialPort('/dev/exists', {
          autoOpen: false,
          baudRate: 14400,
        })
        assert.equal(port.baudRate, 14400)
        try {
          port.baudRate = 9600
        } catch (e) {
          assert.instanceOf(e, TypeError)
        }
        assert.equal(port.baudRate, 14400)
      })
    })

    describe('.path', () => {
      it('is a read only property set during construction', () => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        assert.equal(port.path, '/dev/exists')
        try {
          port.path = 'foo'
        } catch (e) {
          assert.instanceOf(e, TypeError)
        }
        assert.equal(port.path, '/dev/exists')
      })
    })

    describe('.isOpen', () => {
      it('is a read only property', () => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        assert.equal(port.isOpen, false)
        try {
          port.isOpen = 'foo'
        } catch (e) {
          assert.instanceOf(e, TypeError)
        }
        assert.equal(port.isOpen, false)
      })

      it('returns false when the port is created', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        assert.isFalse(port.isOpen)
        done()
      })

      it('returns false when the port is opening', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        sandbox.stub(SerialPort.Binding.prototype, 'open').callsFake(() => {
          assert.isTrue(port.opening)
          assert.isFalse(port.isOpen)
          done()
        })
        port.open()
      })

      it('returns true when the port is open', done => {
        const port = new SerialPort('/dev/exists', () => {
          assert.isTrue(port.isOpen)
          done()
        })
      })

      it('returns false when the port is closing', done => {
        const port = new SerialPort('/dev/exists', {}, () => {
          port.close()
        })
        sandbox.stub(SerialPort.Binding.prototype, 'close').callsFake(() => {
          assert.isFalse(port.isOpen)
          done()
          return Promise.resolve()
        })
      })

      it('returns false when the port is closed', done => {
        const port = new SerialPort('/dev/exists', () => {
          port.close()
        })
        port.on('close', () => {
          assert.isFalse(port.isOpen)
          done()
        })
      })
    })
  })

  describe('instance method', () => {
    describe('#open', () => {
      it('passes the port to the bindings', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        const openSpy = sandbox.spy(port.binding, 'open')
        assert.isFalse(port.isOpen)
        port.open(err => {
          assert.isNull(err)
          assert.isTrue(port.isOpen)
          assert.isTrue(openSpy.calledWith('/dev/exists'))
          done()
        })
      })

      it('passes default options to the bindings', done => {
        const defaultOptions = {
          baudRate: 9600,
          parity: 'none',
          xon: false,
          xoff: false,
          xany: false,
          rtscts: false,
          hupcl: true,
          dataBits: 8,
          stopBits: 1,
        }
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        sandbox.stub(SerialPort.Binding.prototype, 'open').callsFake((path, opt) => {
          assert.equal(path, '/dev/exists')
          assert.containSubset(opt, defaultOptions)
          done()
        })
        port.open()
      })

      it('calls back an error when opening an invalid port', done => {
        const port = new SerialPort('/dev/unhappy', { autoOpen: false })
        port.open(err => {
          assert.instanceOf(err, Error)
          done()
        })
      })

      it('emits data after being reopened', done => {
        const data = Buffer.from('Howdy!')
        const port = new SerialPort('/dev/exists', () => {
          port.close(() => {
            port.open(() => {
              port.binding.emitData(data)
            })
          })
          port.once('data', res => {
            assert.deepEqual(res, data)
            done()
          })
        })
      })

      it('cannot be opened again after open', done => {
        const port = new SerialPort('/dev/exists', () => {
          port.open(err => {
            assert.instanceOf(err, Error)
            done()
          })
        })
      })

      it('cannot be opened while opening', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        port.open(err => {
          assert.isNull(err)
        })
        port.open(err => {
          assert.instanceOf(err, Error)
          done()
        })
      })

      it('allows opening after an open error', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        const stub = sandbox.stub(SerialPort.Binding.prototype, 'open').callsFake(() => {
          return Promise.reject(new Error('Haha no'))
        })
        port.open(err => {
          assert.instanceOf(err, Error)
          stub.restore()
          port.open(done)
        })
      })
    })

    describe('#write', () => {
      it('writes to the bindings layer', done => {
        const data = Buffer.from('Crazy!')
        const port = new SerialPort('/dev/exists')
        port.on('open', () => {
          port.write(data, () => {
            assert.deepEqual(data, port.binding.lastWrite)
            done()
          })
        })
      })

      it('converts strings to buffers', done => {
        const port = new SerialPort('/dev/exists')
        port.on('open', () => {
          const data = 'Crazy!'
          port.write(data, () => {
            const lastWrite = port.binding.lastWrite
            assert.deepEqual(Buffer.from(data), lastWrite)
            done()
          })
        })
      })

      it('converts strings with encodings to buffers', done => {
        const port = new SerialPort('/dev/exists')
        port.on('open', () => {
          const data = 'COFFEE'
          port.write(data, 'hex', () => {
            const lastWrite = port.binding.lastWrite
            assert.deepEqual(Buffer.from(data, 'hex'), lastWrite)
            done()
          })
        })
      })

      it('converts arrays to buffers', done => {
        const port = new SerialPort('/dev/exists')
        port.on('open', () => {
          const data = [0, 32, 44, 88]
          port.write(data, () => {
            const lastWrite = port.binding.lastWrite
            assert.deepEqual(Buffer.from(data), lastWrite)
            done()
          })
        })
      })

      it('queues writes when the port is closed', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        port.write('data', done)
        port.open()
      })

      it('combines many writes into one', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        const spy = sinon.spy(port.binding, 'write')
        port.open(() => {
          port.cork()
          port.write('abc')
          port.write(Buffer.from('123'), () => {
            assert.equal(spy.callCount, 1)
            assert.deepEqual(port.binding.lastWrite, Buffer.from('abc123'))
            done()
          })
          port.uncork()
        })
      })
    })

    describe('#close', () => {
      it('emits a close event', done => {
        const port = new SerialPort('/dev/exists', () => {
          port.on('close', () => {
            assert.isFalse(port.isOpen)
            done()
          })
          port.close()
        })
      })

      it('has a close callback', done => {
        const port = new SerialPort('/dev/exists', () => {
          port.close(() => {
            assert.isFalse(port.isOpen)
            done()
          })
        })
      })

      it('emits the close event and runs the callback', done => {
        let called = 0
        const doneIfTwice = function() {
          called++
          if (called === 2) {
            return done()
          }
        }
        const port = new SerialPort('/dev/exists', () => {
          port.close(doneIfTwice)
        })
        port.on('close', doneIfTwice)
      })

      it('emits an error event or error callback but not both', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        let called = 0
        const doneIfTwice = function(err) {
          assert.instanceOf(err, Error)
          called++
          if (called === 2) {
            return done()
          }
        }
        port.on('error', doneIfTwice)
        port.close()
        port.close(doneIfTwice)
      })

      it('fires a close event after being reopened', done => {
        const port = new SerialPort('/dev/exists', () => {
          const closeSpy = sandbox.spy()
          port.on('close', closeSpy)
          port.close(() => {
            port.open(() => {
              port.close(() => {
                assert.isTrue(closeSpy.calledTwice)
                done()
              })
            })
          })
        })
      })

      it('errors when the port is not open', done => {
        const cb = function() {}
        const port = new SerialPort('/dev/exists', { autoOpen: false }, cb)
        port.close(err => {
          assert.instanceOf(err, Error)
          done()
        })
      })

      it('handles errors in callback', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'close').callsFake(() => {
          return Promise.reject(new Error('like tears in the rain'))
        })
        port.on('open', () => {
          port.close(err => {
            assert.instanceOf(err, Error)
            done()
          })
        })
      })

      it('handles errors in event', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'close').callsFake(() => {
          return Promise.reject(new Error('attack ships on fire off the shoulder of Orion'))
        })
        port.on('open', () => {
          port.close()
        })
        port.on('error', err => {
          assert.instanceOf(err, Error)
          done()
        })
      })
    })

    describe('#update', () => {
      it('errors when the port is not open', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        port.update({}, err => {
          assert.instanceOf(err, Error)
          done()
        })
      })

      it('errors when called without options', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        let errors = 0
        try {
          port.update()
        } catch (e) {
          errors += 1
          assert.instanceOf(e, TypeError)
        }

        try {
          port.update(() => {})
        } catch (e) {
          errors += 1
          assert.instanceOf(e, TypeError)
        }
        assert.equal(errors, 2)
        done()
      })

      it('sets the baudRate on the port', done => {
        const port = new SerialPort('/dev/exists', () => {
          assert.equal(port.baudRate, 9600)
          port.update({ baudRate: 14400 }, err => {
            assert.equal(port.baudRate, 14400)
            assert.isNull(err)
            done()
          })
        })
      })

      it('handles errors in callback', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'update').callsFake(() => {
          return Promise.reject(new Error('like tears in the rain'))
        })
        port.on('open', () => {
          port.update({}, err => {
            assert.instanceOf(err, Error)
            done()
          })
        })
      })

      it('handles errors in event', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'update').callsFake(() => {
          return Promise.reject(new Error('attack ships on fire off the shoulder of Orion'))
        })
        port.on('open', () => {
          port.update({})
        })
        port.on('error', err => {
          assert.instanceOf(err, Error)
          done()
        })
      })
    })

    describe('#set', () => {
      it('errors when serialport not open', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        port.set({}, err => {
          assert.instanceOf(err, Error)
          done()
        })
      })

      it('errors without an options object', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        try {
          port.set()
        } catch (e) {
          assert.instanceOf(e, TypeError)
          done()
        }
      })

      it('sets the flags on the ports bindings', done => {
        const settings = {
          brk: true,
          cts: true,
          dtr: true,
          dts: true,
          rts: true,
        }

        const port = new SerialPort('/dev/exists', () => {
          const spy = sandbox.spy(port.binding, 'set')
          port.set(settings, err => {
            assert.isNull(err)
            assert(spy.calledWith(settings))
            done()
          })
        })
      })

      it('sets missing options to default values', done => {
        const settings = {
          cts: true,
          dts: true,
          rts: false,
        }

        const filledWithMissing = {
          brk: false,
          cts: true,
          dtr: true,
          dts: true,
          rts: false,
        }

        const port = new SerialPort('/dev/exists', () => {
          const spy = sandbox.spy(port.binding, 'set')
          port.set(settings, err => {
            assert.isNull(err)
            assert(spy.calledWith(filledWithMissing))
            done()
          })
        })
      })

      it('resets all flags if none are provided', done => {
        const defaults = {
          brk: false,
          cts: false,
          dtr: true,
          dts: false,
          rts: true,
        }

        const port = new SerialPort('/dev/exists', () => {
          const spy = sandbox.spy(port.binding, 'set')
          port.set({}, err => {
            assert.isNull(err)
            assert(spy.calledWith(defaults))
            done()
          })
        })
      })

      it('handles errors in callback', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'set').callsFake(() => {
          return Promise.reject(new Error('like tears in the rain'))
        })
        port.on('open', () => {
          port.set({}, err => {
            assert.instanceOf(err, Error)
            done()
          })
        })
      })

      it('handles errors in event', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'set').callsFake(() => {
          return Promise.reject(new Error('attack ships on fire off the shoulder of Orion'))
        })
        port.on('open', () => {
          port.set({})
        })
        port.on('error', err => {
          assert.instanceOf(err, Error)
          done()
        })
      })
    })

    describe('#flush', () => {
      it('errors when serialport not open', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        port.flush(err => {
          assert.instanceOf(err, Error)
          done()
        })
      })

      it('calls flush on the bindings', done => {
        const port = new SerialPort('/dev/exists')
        const spy = sinon.spy(port.binding, 'flush')
        port.on('open', () => {
          port.flush(err => {
            assert.isNull(err)
            assert(spy.calledOnce)
            done()
          })
        })
      })

      it('handles errors in callback', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'flush').callsFake(() => {
          return Promise.reject(new Error('like tears in the rain'))
        })
        port.on('open', () => {
          port.flush(err => {
            assert.instanceOf(err, Error)
            done()
          })
        })
      })

      it('handles errors in event', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'flush').callsFake(() => {
          return Promise.reject(new Error('attack ships on fire off the shoulder of Orion'))
        })
        port.on('open', () => {
          port.flush()
        })
        port.on('error', err => {
          assert.instanceOf(err, Error)
          done()
        })
      })
    })

    describe('#drain', () => {
      it('waits for an open port', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        port.drain(err => {
          assert.isNull(err)
          done()
        })
        port.open()
      })

      it('calls drain on the bindings', done => {
        const port = new SerialPort('/dev/exists')
        const spy = sinon.spy(port.binding, 'drain')
        port.on('open', () => {
          port.drain(err => {
            assert.isNull(err)
            assert(spy.calledOnce)
            done()
          })
        })
      })

      it('handles errors in callback', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'drain').callsFake(() => {
          return Promise.reject(new Error('like tears in the rain'))
        })
        port.on('open', () => {
          port.drain(err => {
            assert.instanceOf(err, Error)
            done()
          })
        })
      })

      it('handles errors in event', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'drain').callsFake(() => {
          return Promise.reject(new Error('attack ships on fire off the shoulder of Orion'))
        })
        port.on('open', () => {
          port.drain()
        })
        port.on('error', err => {
          assert.instanceOf(err, Error)
          done()
        })
      })

      it('waits for in progress or queued writes to finish', done => {
        const port = new SerialPort('/dev/exists')
        port.on('error', done)
        let finishedWrite = false
        port.write(Buffer.alloc(10), () => {
          finishedWrite = true
        })
        port.drain(() => {
          assert.isTrue(finishedWrite)
          done()
        })
      })
    })

    describe('#get', () => {
      it('errors when serialport not open', done => {
        const port = new SerialPort('/dev/exists', { autoOpen: false })
        port.get(err => {
          assert.instanceOf(err, Error)
          done()
        })
      })

      it('gets the status from the ports bindings', done => {
        const port = new SerialPort('/dev/exists', () => {
          const spy = sandbox.spy(port.binding, 'get')
          port.get((err, status) => {
            assert.isNull(err)
            assert(spy.calledOnce)
            assert.deepEqual(status, {
              cts: true,
              dsr: false,
              dcd: false,
            })
            done()
          })
        })
      })

      it('handles errors in callback', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'get').callsFake(() => {
          return Promise.reject(new Error('like tears in the rain'))
        })
        port.on('open', () => {
          port.get(err => {
            assert.instanceOf(err, Error)
            done()
          })
        })
      })

      it('handles errors in event', done => {
        const port = new SerialPort('/dev/exists')
        sinon.stub(port.binding, 'get').callsFake(() => {
          return Promise.reject(new Error('attack ships on fire off the shoulder of Orion'))
        })
        port.on('open', () => {
          port.get()
        })
        port.on('error', err => {
          assert.instanceOf(err, Error)
          done()
        })
      })
    })
  })

  describe('reading data', () => {
    it('emits data events by default', done => {
      const testData = Buffer.from('I am a really short string')
      const port = new SerialPort('/dev/exists', () => {
        port.once('data', recvData => {
          assert.deepEqual(recvData, testData)
          done()
        })
        port.binding.write(testData)
      })
    })
  })

  describe('disconnect close errors', () => {
    it('emits as a disconnected close event on a bad read', done => {
      const port = new SerialPort('/dev/exists')
      sinon.stub(port.binding, 'read').callsFake(() => {
        return Promise.reject(new Error('EBAD_ERR'))
      })
      port.on('close', err => {
        assert.instanceOf(err, Error)
        assert.isTrue(err.disconnected)
        done()
      })
      port.on('error', done) // this shouldn't be called
      port.read()
    })
  })
})
