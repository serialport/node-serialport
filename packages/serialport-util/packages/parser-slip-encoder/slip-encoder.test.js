'use strict'
/* eslint-disable no-new */

const Buffer = require('safe-buffer').Buffer
const sinon = require('sinon')

const SlipEncoder = require('./slip-encoder')

describe('SlipEncoderParser', () => {

	it ('Adds one delimiter to one-byte messages', ()=>{
		const spy = sinon.spy()
		const encoder = new SlipEncoder();
		encoder.on('data', spy);

		encoder.write(Buffer.from([0x01]));
		encoder.write(Buffer.from([0x80]));
		encoder.write(Buffer.from([0xFF]));
		encoder.write(Buffer.from([0xA5]));

		assert.equal(spy.callCount, 4);
		assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01, 0xC0]));
		assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0x80, 0xC0]));
		assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xFF, 0xC0]));
		assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xA5, 0xC0]));
	});

	it ('Adds two delimiters to one-byte messages with the bluetooth quirk', ()=>{
		const spy = sinon.spy()
		const encoder = new SlipEncoder({ bluetoothQuirk: true });
		encoder.on('data', spy);

		encoder.write(Buffer.from([0x01]));
		encoder.write(Buffer.from([0x80]));
		encoder.write(Buffer.from([0xFF]));
		encoder.write(Buffer.from([0xA5]));

		assert.equal(spy.callCount, 4);
		assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0xC0, 0x01, 0xC0]));
		assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0xC0, 0x80, 0xC0]));
		assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xC0, 0xFF, 0xC0]));
		assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xC0, 0xA5, 0xC0]));
	});

	it ('Adds one delimiter to zero-byte messages', ()=>{
		const spy = sinon.spy()
		const encoder = new SlipEncoder();
		encoder.on('data', spy);

		encoder.write(Buffer.from([]));

		assert.equal(spy.callCount, 1);
		assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0xC0]));
	});

	it ('Does nothing with zero-byte messages with the bluetooth quirk', ()=>{
		const spy = sinon.spy()

		const encoder = new SlipEncoder({ bluetoothQuirk: true });

		encoder.on('data', spy);

		encoder.write(Buffer.from([]));
		encoder.write(Buffer.from([]));
		encoder.write(Buffer.from([]));
		encoder.write(Buffer.from([]));

		assert.equal(spy.callCount, 0);
	});


	it ('Escapes characters', ()=>{
		const spy = sinon.spy()
		const encoder = new SlipEncoder();
		encoder.on('data', spy);

		encoder.write(Buffer.from([0x01]));
		encoder.write(Buffer.from([0xC0]));
		encoder.write(Buffer.from([0xDB]));
		encoder.write(Buffer.from([0xDC]));
		encoder.write(Buffer.from([0xDD]));
		encoder.write(Buffer.from([0xFF]));

		assert.equal(spy.callCount, 6);
		assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0x01, 0xC0]));
		assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0xDB, 0xDC, 0xC0]));
		assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xDB, 0xDD, 0xC0]));
		assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xDC, 0xC0]));
		assert.deepEqual(spy.getCall(4).args[0], Buffer.from([0xDD, 0xC0]));
		assert.deepEqual(spy.getCall(5).args[0], Buffer.from([0xFF, 0xC0]));
	});

	it ('Escapes characters with the bluetooth quirk', ()=>{
		const spy = sinon.spy()
		const encoder = new SlipEncoder({ bluetoothQuirk: true });
		encoder.on('data', spy);

		encoder.write(Buffer.from([0x01]));
		encoder.write(Buffer.from([0xC0]));
		encoder.write(Buffer.from([0xDB]));
		encoder.write(Buffer.from([0xDC]));
		encoder.write(Buffer.from([0xDD]));
		encoder.write(Buffer.from([0xFF]));

		assert.equal(spy.callCount, 6);
		assert.deepEqual(spy.getCall(0).args[0], Buffer.from([0xC0, 0x01, 0xC0]));
		assert.deepEqual(spy.getCall(1).args[0], Buffer.from([0xC0, 0xDB, 0xDC, 0xC0]));
		assert.deepEqual(spy.getCall(2).args[0], Buffer.from([0xC0, 0xDB, 0xDD, 0xC0]));
		assert.deepEqual(spy.getCall(3).args[0], Buffer.from([0xC0, 0xDC, 0xC0]));
		assert.deepEqual(spy.getCall(4).args[0], Buffer.from([0xC0, 0xDD, 0xC0]));
		assert.deepEqual(spy.getCall(5).args[0], Buffer.from([0xC0, 0xFF, 0xC0]));
	});
});
