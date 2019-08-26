const BindingMock = require('./binding-mock')

// copypasta from bindings/lib/bindings.test.js
function shouldReject(promise, errType = Error, message = 'Should have rejected') {
  return promise.then(
    () => {
      throw new Error(message)
    },
    err => {
      assert.instanceOf(err, errType)
    }
  )
}

describe('BindingMock', () => {
  it('constructs', () => {
    new BindingMock({})
  })

  describe('instance method', () => {
    beforeEach(function() {
      this.binding = new BindingMock({})
    })

    describe('open', () => {
      describe('when phony port not created', () => {
        it('should reject', function() {
          return shouldReject(this.binding.open('/dev/ttyUSB0', {}))
        })
      })

      describe('when phony port created', () => {
        beforeEach(() => {
          BindingMock.createPort('/dev/ttyUSB0')
        })

        afterEach(() => {
          BindingMock.reset()
        })

        it('should open the phony port', async function() {
          await this.binding.open('/dev/ttyUSB0', {})
          assert.isTrue(this.binding.isOpen)
        })

        it('should have a "port" prop with "info.serialNumber" prop', async function() {
          await this.binding.open('/dev/ttyUSB0', {})
          assert.strictEqual(this.binding.port.info.serialNumber, 1)
        })
      })
    })
  })

  describe('static method', () => {
    describe('createPort', () => {
      afterEach(() => {
        BindingMock.reset()
      })

      it('should increment the serialNumber', async () => {
        BindingMock.createPort('/dev/ttyUSB0')
        BindingMock.createPort('/dev/ttyUSB1')
        const binding1 = new BindingMock({})
        await binding1.open('/dev/ttyUSB0', {})
        const binding2 = new BindingMock({})
        await binding2.open('/dev/ttyUSB1', {})
        assert.strictEqual(binding2.port.info.serialNumber, 2)
      })
    })
    describe('reset', () => {
      beforeEach(async function() {
        BindingMock.createPort('/dev/ttyUSB0')
        this.binding = new BindingMock({})
        await this.binding.open('/dev/ttyUSB0', {})
        assert.strictEqual(this.binding.port.info.serialNumber, 1)
        await this.binding.close()
      })

      afterEach(async function() {
        // speculative cleanup
        try {
          await this.binding.close()
        } catch (ignored) {}
      })

      it('should delete any configured phony ports', function() {
        BindingMock.reset()
        return shouldReject(this.binding.open('/dev/ttyUSB0', {}))
      })

      it('should reset the serialNumber assigned to the phony port', async function() {
        BindingMock.reset()
        BindingMock.createPort('/dev/ttyUSB0')
        await this.binding.open('/dev/ttyUSB0', {})
        assert.strictEqual(this.binding.port.info.serialNumber, 1)
      })
    })
  })
})
