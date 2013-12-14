var SerialPort = require("serialport").SerialPort;

var sp = new SerialPort("/dev/cu.Cubelet-RGB", {
  baudrate: 38400
});

sp.on('open',function() {
  sp.on('data', function(data) {
    console.log('>>>>>', data);
  });

  var message = new Buffer('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');

  function writeThenDrainThenWait(duration) {
    console.log('Calling write...');
    sp.write(message, function() {
      console.log('...Write callback returned...');
      // At this point, data may still be buffered and not sent out from the port yet (write function returns asynchrounously).
      console.log('...Calling drain...');
      sp.drain(function() {
        // Now data has "left the pipe" (tcdrain[1]/FlushFileBuffers[2] finished blocking).
        // [1] http://linux.die.net/man/3/tcdrain
        // [2] http://msdn.microsoft.com/en-us/library/windows/desktop/aa364439(v=vs.85).aspx
        console.log('...Drain callback returned...');
        console.log('...Waiting', duration, 'milliseconds...');
        setInterval(writeThenDrainThenWait, duration);
      });
    });
  };

  function writeThenWait(duration) {
    console.log('Calling write...');
    sp.write(message, function() {
      console.log('...Write callback returned...'); // Write function call immediately returned (asynchrounous).
      console.log('...Waiting', duration, 'milliseconds...');
      // Even though write returned, the data may still be in the pipe, and hasn't reached your robot yet.
      setInterval(writeThenWait, duration);
    });
  };

  // Stuff starts happening here
  writeThenDrainThenWait(1000);
  //writeThenWait(1000);

});
