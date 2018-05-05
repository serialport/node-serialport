'use strict'
const Buffer = require('safe-buffer').Buffer
const Transform = require('stream').Transform

const END = 0xC0;
const ESC = 0xDB;
const ESC_END = 0xDC;
const ESC_ESC = 0xDD;

/**
* A transform stream that emits SLIP-encoded data for each incoming packet.
* @extends Transform
* @summary Runs in O(n) time, adding a 0xC0 character at the end of each
* received packet and escaping characters, according to RFC 1055. Adds another
* 0xC0 character at the beginning if the `bluetoothQuirk` option is truthy (as
* per the Bluetooth Core Specification 4.0, Volume 4, Part D, Chapter 3 "SLIP Layer").
* Runs in O(n) time.
* @example
// Read lines from a text file, then SLIP-encode each and send them to a serial port
const SerialPort = require('serialport')
const SlipEncoder = require('parser-slip-encoder')
const Readline = require('parser-readline')
const fileReader = require('fs').createReadStream('/tmp/some-file.txt');
const port = new SerialPort('/dev/tty-usbserial1')
const lineParser = fileReader.pipe(new Readline({ delimiter: '\r\n' }));
const encoder = fileReader.pipe(new SlipEncoder({ bluetoothQuirk: false }));
encoder.pipe(port);
*/
class SlipEncoderParser extends Transform {
	constructor (options) {
		options = options || {}
		super(options)

		if (options.bluetoothQuirk) {
			this._bluetoothQuirk = true;
		}
	}

	_transform (chunk, encoding, cb) {
		const chunkLength = chunk.length;

		if (this._bluetoothQuirk && chunkLength === 0) {
			// Edge case: push no data. Bluetooth-quirky SLIP parsers don't like
			// lots of 0xC0s together.
			return cb();
		}

		// Allocate memory for the worst-case scenario: all bytes are escaped,
		// plus start and end separators.
		let encoded = Buffer.alloc((chunkLength * 2) + 2);
		let j = 0;

		if (this._bluetoothQuirk) {
			encoded[j++] = END;
		}

		for (let i=0; i<chunkLength; i++) {
			let byte = chunk[i];
			if (byte === END) {
				encoded[j++] = ESC;
				byte = ESC_END;
			} else if (byte === ESC) {
				encoded[j++] = ESC;
				byte = ESC_ESC;
			}

			encoded[j++] = byte;
		}

		encoded[j++] = END;

		cb(null, encoded.slice(0, j));
	}
}

module.exports = SlipEncoderParser
