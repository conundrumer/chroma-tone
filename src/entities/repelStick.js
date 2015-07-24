'use strict';

var Stick = require('./stick');

class RepelStick extends Stick {

  shouldResolve() {
    return this.length < this.restLength;
  }

}

module.exports = RepelStick;
