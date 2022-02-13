import { ErrorCallback, OpenOptions, SerialPortStream, StreamOptions } from '@serialport/stream'
import { autoDetect, AutoDetectTypes, OpenOptionsFromBinding } from '@serialport/bindings-cpp'

const DetectedBinding = autoDetect()

export type SerialPortOpenOptions<T extends AutoDetectTypes> = Omit<StreamOptions<T>, 'binding'> & OpenOptionsFromBinding<T>

export class SerialPort<T extends AutoDetectTypes = AutoDetectTypes> extends SerialPortStream<T> {
  static list = DetectedBinding.list
  static readonly binding = DetectedBinding

  constructor(options: SerialPortOpenOptions<T>, openCallback?: ErrorCallback) {
    const opts: OpenOptions<T> = {
      binding: DetectedBinding as T,
      ...options,
    }
    super(opts, openCallback)
  }
}
