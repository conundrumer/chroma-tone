'use strict';

var Stick = require('./stick');

class ScarfStick extends Stick {

  doResolve() {
    let delta = this.getDelta().mulS(2);
    this.q.pos.add(delta);
  }

}

module.exports = ScarfStick;
