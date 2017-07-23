'use strict';

const listLinux = require('./mocks/linux-list');

const ports =
    'P: /devices/platform/serial8250/tty/ttyS0\n' +
    'N: ttyS0\n' +
    'E: DEVNAME=/dev/ttyS0\n' +
    'E: DEVPATH=/devices/platform/serial8250/tty/ttyS0\n' +
    'E: MAJOR=4\n' +
    'E: MINOR=64\n' +
    'E: SUBSYSTEM=tty\n' +

    'P: /devices/platform/serial8250/tty/ttyS1\n' +
    'N: ttyS1\n' +
    'E: DEVNAME=/dev/ttyS1\n' +
    'E: DEVPATH=/devices/platform/serial8250/tty/ttyS1\n' +
    'E: MAJOR=4\n' +
    'E: MINOR=65\n' +
    'E: SUBSYSTEM=tty\n' +

    'P: /dev/ttyUSB-Arduino\n' +
    'N: ttyUSB-Arduino\n' +
    'E: DEVNAME=/dev/ttyUSB-Arduino\n' +
    'E: ID_VENDOR=Arduino (www.arduino.cc)\n' +
    'E: ID_SERIAL=752303138333518011C1\n' +
    'E: ID_VENDOR_ID=2341\n' +
    'E: ID_MODEL_ID=0043\n' +
    'E: DEVLINKS=/dev/serial/by-path/pci-0000:00:14.0-usb-0:2:1.0-port0 /dev/serial/by-id/pci-NATA_Siolynx2_C8T6VI1F-if00-port0\n' +

    'P: /devices/unknown\n' +
    'N: ttyAMA_im_a_programmer\n' +
    'E: DEVNAME=/dev/ttyAMA_im_a_programmer\n' +
    'E: DEVLINKS=/dev/serial/by-id/pci-NATA_Siolynx2_C8T6VI1F-if00-port0 /dev/serial/by-path/pci-0000:00:14.0-usb-0:2:1.0-port0\n' +

    'P: /devices/unknown\n' +
    'N: ttyMFD0\n' +
    'E: DEVNAME=/dev/ttyMFD0\n' +
    'E: ID_VENDOR_ID=0x2341\n' +
    'E: ID_MODEL_ID=0x0043\n' +

    'P: /devices/unknown\n' +
    'N: rfcomm4\n' +
    'E: DEVNAME=/dev/rfcomm4\n' +

    'P: /devices/unknown\n' +
    'N: ttyNOTASERIALPORT\n'
;

const portOutput = [
  {
    comName: '/dev/ttyS0'
  },
  {
    comName: '/dev/ttyS1'
  },
  {
    comName: '/dev/ttyUSB-Arduino',
    manufacturer: 'Arduino (www.arduino.cc)',
    serialNumber: '752303138333518011C1',
    pnpId: 'pci-NATA_Siolynx2_C8T6VI1F-if00-port0',
    vendorId: '0x2341',
    productId: '0x0043'
  },
  {
    comName: '/dev/ttyAMA_im_a_programmer',
    pnpId: 'pci-NATA_Siolynx2_C8T6VI1F-if00-port0'
  },
  {
    comName: '/dev/ttyMFD0',
    vendorId: '0x2341',
    productId: '0x0043'
  },
  {
    comName: '/dev/rfcomm4'
  }
];

describe('listLinux', () => {
  beforeEach(() => {
    listLinux.reset();
  });

  it('lists available serialports', () => {
    listLinux.setPorts(ports);
    return listLinux().then((ports) => {
      assert.deepEqual(ports, portOutput);
    });
  });
});
