import { ErrorCallback, OpenOptions, SerialPortStream } from '@serialport/stream'
import { autoDetect, AutoDetectTypes } from '@serialport/bindings-cpp'

const DetectedBinding = autoDetect()

export type SerialPortOpenOptions = Omit<OpenOptions<AutoDetectTypes>, 'binding'>

export class SerialPort extends SerialPortStream<AutoDetectTypes> {
  /**
   * Retrieves a list of available serial ports with metadata. Only the `path` is guaranteed. If unavailable the other fields will be undefined. The `path` is either the path or an identifier (eg `COM1`) used to open the SerialPort.
   *
   * We make an effort to identify the hardware attached and have consistent results between systems. Linux and OS X are mostly consistent. Windows relies on 3rd party device drivers for the information and is unable to guarantee the information. On windows If you have a USB connected device can we provide a serial number otherwise it will be `undefined`. The `pnpId` and `locationId` are not the same or present on all systems. The examples below were run with the same Arduino Uno.
   * Resolves with the list of available serial ports.
   * @example
  ```js
  // OSX example port
  {
    path: '/dev/tty.usbmodem1421',
    manufacturer: 'Arduino (www.arduino.cc)',
    serialNumber: '752303138333518011C1',
    pnpId: undefined,
    locationId: '14500000',
    productId: '0043',
    vendorId: '2341'
  }

  // Linux example port
  {
    path: '/dev/ttyACM0',
    manufacturer: 'Arduino (www.arduino.cc)',
    serialNumber: '752303138333518011C1',
    pnpId: 'usb-Arduino__www.arduino.cc__0043_752303138333518011C1-if00',
    locationId: undefined,
    productId: '0043',
    vendorId: '2341'
  }

  // Windows example port
  {
    path: 'COM3',
    manufacturer: 'Arduino LLC (www.arduino.cc)',
    serialNumber: '752303138333518011C1',
    pnpId: 'USB\\VID_2341&PID_0043\\752303138333518011C1',
    locationId: 'Port_#0003.Hub_#0001',
    productId: '0043',
    vendorId: '2341'
  }
  ```

  ```js
  var SerialPort = require('serialport');

  // promise approach
  SerialPort.list()
    .then(ports) {...});
    .catch(err) {...});
  ```
  */
  static list = DetectedBinding.list

  constructor(options: SerialPortOpenOptions, openCallback?: ErrorCallback) {
    const opts: OpenOptions<AutoDetectTypes> = {
      binding: DetectedBinding,
      ...options,
    }
    super(opts, openCallback)
  }
}
