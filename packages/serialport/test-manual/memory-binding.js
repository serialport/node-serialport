const port = process.env.TEST_PORT

if (!port) {
  console.error('Please pass TEST_PORT environment variable')
  process.exit(1)
}

// var Binding = require('@serialport/binding-mock');
// Binding.createPort(port);
const Binding = require('../').Binding

const defaultOpenOptions = {
  baudRate: 9600,
  dataBits: 8,
  hupcl: true,
  lock: true,
  parity: 'none',
  rtscts: false,
  stopBits: 1,
  xany: false,
  xoff: false,
  xon: false,
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

  const binding = new Binding({
    disconnect() {
      throw new Error('disconnect')
    },
  })
  binding.open(port, defaultOpenOptions, err => {
    if (err) {
      throw err
    }
    binding.close(makePort)
  })
}

makePort()
