const listLinux = require('./mocks/linux-list')

const ports = String.raw`
P: /devices/platform/serial8250/tty/ttyS0
N: ttyS0
E: DEVNAME=/dev/ttyS0
E: DEVPATH=/devices/platform/serial8250/tty/ttyS0
E: MAJOR=4
E: MINOR=64
E: SUBSYSTEM=tty

P: /devices/platform/serial8250/tty/ttyS1
N: ttyS1
E: DEVNAME=/dev/ttyS1
E: DEVPATH=/devices/platform/serial8250/tty/ttyS1
E: MAJOR=4
E: MINOR=65
E: SUBSYSTEM=tty

P: /devices/pci0000:00/0000:00:06.0/usb1/1-2/1-2:1.0/tty/ttyACM0
N: ttyACM0
S: serial/by-id/usb-Arduino__www.arduino.cc__0043_752303138333518011C1-if00
S: serial/by-path/pci-0000:00:06.0-usb-0:2:1.0
E: DEVLINKS=/dev/serial/by-path/pci-0000:00:06.0-usb-0:2:1.0 /dev/serial/by-id/usb-Arduino__www.arduino.cc__0043_752303138333518011C1-if00
E: DEVNAME=/dev/ttyACM0
E: DEVPATH=/devices/pci0000:00/0000:00:06.0/usb1/1-2/1-2:1.0/tty/ttyACM0
E: ID_BUS=usb
E: ID_MM_CANDIDATE=1
E: ID_MODEL=0043
E: ID_MODEL_ENC=0043
E: ID_MODEL_FROM_DATABASE=Uno R3 (CDC ACM)
E: ID_MODEL_ID=0043
E: ID_PATH=pci-0000:00:06.0-usb-0:2:1.0
E: ID_PATH_TAG=pci-0000_00_06_0-usb-0_2_1_0
E: ID_PCI_CLASS_FROM_DATABASE=Serial bus controller
E: ID_PCI_INTERFACE_FROM_DATABASE=OHCI
E: ID_PCI_SUBCLASS_FROM_DATABASE=USB controller
E: ID_REVISION=0001
E: ID_SERIAL=Arduino__www.arduino.cc__0043_752303138333518011C1
E: ID_SERIAL_SHORT=752303138333518011C1
E: ID_TYPE=generic
E: ID_USB_CLASS_FROM_DATABASE=Communications
E: ID_USB_DRIVER=cdc_acm
E: ID_USB_INTERFACES=:020201:0a0000:
E: ID_USB_INTERFACE_NUM=00
E: ID_VENDOR=Arduino__www.arduino.cc_
E: ID_VENDOR_ENC=Arduino\x20\x28www.arduino.cc\x29
E: ID_VENDOR_FROM_DATABASE=Arduino SA
E: ID_VENDOR_ID=2341
E: MAJOR=166
E: MINOR=0
E: SUBSYSTEM=tty
E: TAGS=:systemd:
E: USEC_INITIALIZED=2219936602

P: /devices/unknown
N: ttyAMA_im_a_programmer
E: DEVNAME=/dev/ttyAMA_im_a_programmer
E: DEVLINKS=/dev/serial/by-id/pci-NATA_Siolynx2_C8T6VI1F-if00-port0 /dev/serial/by-path/pci-0000:00:14.0-usb-0:2:1.0-port0

P: /devices/unknown
N: ttyMFD0
E: DEVNAME=/dev/ttyMFD0
E: ID_VENDOR_ID=0x2343
E: ID_MODEL_ID=0043
E: ID_MODEL_ENC=some device made by someone

P: /devices/unknown
N: rfcomm4
E: DEVNAME=/dev/rfcomm4

P: /devices/unknown
N: ttyNOTASERIALPORT
`

const portOutput = [
  {
    path: '/dev/ttyS0',
  },
  {
    path: '/dev/ttyS1',
  },
  {
    path: '/dev/ttyACM0',
    manufacturer: 'Arduino (www.arduino.cc)',
    serialNumber: '752303138333518011C1',
    productId: '0043',
    vendorId: '2341',
    pnpId: 'usb-Arduino__www.arduino.cc__0043_752303138333518011C1-if00',
  },
  {
    path: '/dev/ttyAMA_im_a_programmer',
    pnpId: 'pci-NATA_Siolynx2_C8T6VI1F-if00-port0',
  },
  {
    path: '/dev/ttyMFD0',
    vendorId: '2343',
    productId: '0043',
  },
  {
    path: '/dev/rfcomm4',
  },
]

describe('listLinux', () => {
  beforeEach(() => {
    listLinux.reset()
  })

  it('lists available serialports', () => {
    listLinux.setPorts(ports)
    return listLinux().then(ports => {
      assert.containSubset(ports, portOutput)
    })
  })

  it('rejects on non-zero exit codes', () => {
    const list = listLinux()
    listLinux.emit('close', 1)

    list.then(
      () => {
        assert.fail('should not resolve for non-zero exit codes')
      },
      error => {
        assert(error, new Error('Error listing ports udevadm exited with error code: 1'))
      }
    )
  })
})
