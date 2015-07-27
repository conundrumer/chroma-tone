'use strict';

var Stick = require('./Stick');

class BindStick extends Stick {

  constructor(id, p, q, endurance) {
    super(id, p, q);
    this.endurance = endurance * this.restLength * 0.5;
  }

  shouldCrash(crashed) {
    return crashed || this.diff > this.endurance;
  }

  shouldResolve(crashed) {
    return !this.shouldCrash(crashed);
  }

}

module.exports = BindStick;
