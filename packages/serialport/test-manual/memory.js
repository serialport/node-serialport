const SerialPort = require('../')
const port = process.env.TEST_PORT

if (!port) {
  console.error('Please pass TEST_PORT environment variable')
  process.exit(1)
}

let counter = 0

function makePort(err) {
  if (err) {
    throw err
  }
  counter++
  if (counter % 1000 === 0) {
    console.log(`Attempt ${counter}`)
    // debugger;
  }
  if (counter > 10000) {
    process.exit(0)
  }
  const serialPort = new SerialPort(port, err => {
    if (err) {
      throw err
    }
    serialPort.close(makePort)
  })
}

makePort()
