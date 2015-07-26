'use strict';

var Joint = require('./Joint');

class ClockwiseCrashJoint extends Joint {

  isClockwise() {
    // allow kramuals
    return this.s.getVector().cross(this.t.getVector()) >= 0;
  }

  shouldResolve() {
    return false;
  }

  shouldCrash(crashed) {
    return crashed || !this.isClockwise();
  }

}

module.exports = ClockwiseCrashJoint;
