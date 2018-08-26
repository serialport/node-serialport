/* eslint-disable node/no-missing-require */

/**
 * This is a small example app to turn off and on
 * the built-in LED of an arduino by data sent
 * from the browser with socket.io.
 */

// Initialize application constants
const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const tcpPort = process.env.PORT || 3000

const SerialPort = require('serialport')

const port = new SerialPort('/dev/cu.usbmodem1411', {
  baudRate: 9600,
})

const byteParser = new SerialPort.parsers.ByteLength({ length: 1 })
port.pipe(byteParser)

// Values to send over to Arduino.
const HIGH = Buffer.from([1])
const LOW = Buffer.from([0])

/* ===========================================
*
* Setup a simple server.
*
=========================================== */

app.get('/', (req, res) => {
  res.sendfile('index.html')
})

http.listen(tcpPort, () => {
  console.log(`listening on http://localhost:${tcpPort}`)
})

/* ===========================================
*
*  Socket.io stuff
*
=========================================== */

io.on('connection', socket => {
  console.log('a user connected')

  /**
   * Socket listener to determine whether or not to send HIGH / LOW
   * values to Arduino.
   */
  socket.on('message', msg => {
    console.log('Message received: ', msg)
    switch (msg) {
      case 'on':
        port.write(HIGH)
        break
      case 'off':
        port.write(LOW)
        break
      default:
        break
    }
  })
})

/* ===========================================
*
* Serialport stuff
*
=========================================== */

port.on('open', () => {
  console.log('Port is open!')
})

/**
 * listen to the bytes as they are parsed from the parser.
 */
byteParser.on('data', data => {
  let message

  if (HIGH.compare(data) === 0) {
    message = 'LED successfully turned on.'
  } else if (LOW.compare(data) === 0) {
    message = 'LED successfully turned off.'
  } else {
    message = 'LED did not behave as expected.'
  }

  io.sockets.emit('new message', message)
})

port.on('close', () => {
  console.log('Serial port disconnected.')
  io.sockets.emit('close')
})
