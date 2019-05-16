const listLinux = require('./mocks/linux-list')
const { readFileSync } = require('fs')

describe('listLinux', () => {
  beforeEach(() => {
    listLinux.reset()
  })

  it('lists available serial ports', () => {
    listLinux.setPorts(readFileSync(`${__dirname}/linux-list.test.txt`))
    return listLinux().then(ports => {
      assert.deepEqual(ports, [
        {
          manufacturer: undefined,
          path: '/dev/ttyS0',
          pnpId: undefined,
          productId: undefined,
          serialNumber: undefined,
          vendorId: undefined,
        },
        {
          manufacturer: undefined,
          path: '/dev/ttyS1',
          pnpId: undefined,
          productId: undefined,
          serialNumber: undefined,
          vendorId: undefined,
        },
        {
          path: '/dev/serial/by-id/usb-Arduino__www.arduino.cc__0043_752303138333518011C1-if00',
          manufacturer: 'Arduino (www.arduino.cc)',
          serialNumber: '752303138333518011C1',
          productId: '0043',
          vendorId: '2341',
          pnpId: 'usb-Arduino__www.arduino.cc__0043_752303138333518011C1-if00',
        },
        {
          path: '/dev/serial/by-id/pci-NATA_Siolynx2_C8T6VI1F-if00-port0',
          manufacturer: undefined,
          pnpId: 'pci-NATA_Siolynx2_C8T6VI1F-if00-port0',
          productId: undefined,
          serialNumber: undefined,
          vendorId: undefined,
        },
        {
          path: '/dev/ttyMFD0',
          manufacturer: undefined,
          pnpId: undefined,
          vendorId: '2343',
          serialNumber: undefined,
          productId: '0043',
        },
        {
          manufacturer: undefined,
          path: '/dev/rfcomm4',
          pnpId: undefined,
          productId: undefined,
          serialNumber: undefined,
          vendorId: undefined,
        },
        {
          manufacturer: 'Texas Instruments',
          path: '/dev/serial/by-id/usb-Texas_Instruments_TI_CC2531_USB_CDC___0X00124B0018ED3589-if00',
          pnpId: 'usb-Texas_Instruments_TI_CC2531_USB_CDC___0X00124B0018ED3589-if00',
          productId: '16a8',
          serialNumber: '__0X00124B0018ED3589',
          vendorId: '0451',
        },
        {
          manufacturer: 'Silicon Labs',
          path: '/dev/serial/by-id/usb-Silicon_Labs_CP2102_USB_to_UART_Bridge_Controller_0001-if00-port0',
          pnpId: 'usb-Silicon_Labs_CP2102_USB_to_UART_Bridge_Controller_0001-if00-port0',
          productId: 'ea60',
          serialNumber: '0001',
          vendorId: '10c4',
        },
        {
          manufacturer: 'Silicon Labs',
          path: '/dev/serial/by-id/usb-Silicon_Labs_CP2104_USB_to_UART_Bridge_Controller_010625FA-if00-port0',
          pnpId: 'usb-Silicon_Labs_CP2104_USB_to_UART_Bridge_Controller_010625FA-if00-port0',
          productId: 'ea60',
          serialNumber: '010625FA',
          vendorId: '10c4',
        },
      ])
    })
  })
})
