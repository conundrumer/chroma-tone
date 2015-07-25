'use strict';

var Stick = require('./Stick');

class RepelStick extends Stick {

  shouldResolve() {
    return this.length < this.restLength;
  }

}

module.exports = RepelStick;
