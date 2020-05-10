const BindingMock = require('../')

describe('BindingMock', () => {
  it('constructs', () => {
    new BindingMock({})
  })

  let binding

  describe('instance method', () => {
    beforeEach(() => {
      binding = new BindingMock({})
    })

    describe('open', () => {
      describe('when phony port not created', () => {
        it('should reject', () => {
          return shouldReject(binding.open('/dev/ttyUSB0', {}))
        })
      })

      describe('when phony port created', () => {
        beforeEach(() => {
          BindingMock.createPort('/dev/ttyUSB0')
        })

        afterEach(() => {
          BindingMock.reset()
        })

        it('should open the phony port', async () => {
          await binding.open('/dev/ttyUSB0', {})
          assert.isTrue(binding.isOpen)
        })

        it('should have a "port" prop with "info.serialNumber" prop', async () => {
          await binding.open('/dev/ttyUSB0', {})
          assert.strictEqual(binding.port.info.serialNumber, 1)
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
      beforeEach(async () => {
        BindingMock.createPort('/dev/ttyUSB0')
        binding = new BindingMock({})
        await binding.open('/dev/ttyUSB0', {})
        assert.strictEqual(binding.port.info.serialNumber, 1)
        await binding.close()
      })

      afterEach(async () => {
        // speculative cleanup
        try {
          await binding.close()
        } catch (ignored) {
          // ignored
        }
      })

      it('should delete any configured phony ports', () => {
        BindingMock.reset()
        return shouldReject(binding.open('/dev/ttyUSB0', {}))
      })

      it('should reset the serialNumber assigned to the phony port', async () => {
        BindingMock.reset()
        BindingMock.createPort('/dev/ttyUSB0')
        await binding.open('/dev/ttyUSB0', {})
        assert.strictEqual(binding.port.info.serialNumber, 1)
      })
    })
  })
})
