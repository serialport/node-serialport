'use strict';

var chai = require('chai'),
    should = chai.should(),
    chaiAsPromised = require('chai-as-promised'),
    sinonChai = require('sinon-chai'),
    sinon = require('sinon'),
    sinonAsPromised = require('sinon-as-promised');

chai.use(sinonChai);
chai.use(chaiAsPromised);

global.chai;
global.expect = chai.expect;
global.sinon = sinon;
