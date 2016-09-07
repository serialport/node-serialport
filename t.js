var _ = require('lodash');
var Promise = require('bluebird');
var serialport = require('./lib/serialport');
var heapdump = require('heapdump');

var port = process.env.TEST_PORT;

if (!port) {
  console.error('Please pass TEST_PORT environment variable');
  process.exit(1);
}

setInterval(function() {
	typeof gc !== 'undefined' && console.log('forcing GC') && gc();
	console.log(process.memoryUsage());
}, 1000);

function dumpHeap() {
	console.log('Dumping heap');
	heapdump.writeSnapshot();
}

setTimeout(dumpHeap, 6000);
setInterval(dumpHeap, 30000);

var counter = 0;

function makePromise() {
	var self = {};
	return new Promise(function(resolve, reject) {
		if (counter++ % 100 == 0) {
			console.log('Attempt ' + counter);
		}
		var options = {
			baudrate: 115200,
			parser: serialport.parsers.raw,
			autoOpen: false
		};
		self.serialPort = new serialport(port, options);
			function Oo(c) {
			this.counter = c;
			this.arr = "thisisstring";
			for (var i = 0; i < 100; i++) {
				this.arr += i + c;
			}
		}
		self.serialPort.on('open', resolve.bind(new Oo(counter)));
		self.serialPort.on('error', reject);
		self.serialPort.open();
	}).then(function(err) {
		if (_.isUndefined(err) || _.isNull(err)) {
			return Promise.resolve();
		} else {
			return Promise.reject(err);
		}
	}).then(function() {
		return new Promise(function(resolve) {
			self.serialPort.on('close', resolve);
			self.serialPort.close();
		});
	}).then(function(err) {
		//console.log('Closed successfully');
		return Promise.resolve();
	}).then(function() {return makePromise();});
}

makePromise().then(function() {
	process.exit(0);
});
