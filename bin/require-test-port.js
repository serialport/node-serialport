'use strict';

if (!process.env.TEST_PORT) {
  console.error('The Environment Variable TEST_PORT needs to be set to a valid port')
  process.exit(1);
}
