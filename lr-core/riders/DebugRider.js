'use strict';

var Rider = require('./Rider');

class DebugRider extends Rider {

  step(lineStore, gravity) {
    // this.initializeDebuggingthing();
    return super.step(lineStore, gravity);
  }

  stepPoint(point, gravity) {
    super.stepPoint(point, gravity);
  }

  stepConstraint(constraint, i) {
    let hasCrashed = this.crashed;

    super.stepConstraint(constraint, i);

    if (!hasCrashed && this.crashed) {
      console.log('craSHED!12UI4!!~');
    }
  }

  getSolidLines(lineStore, point) {
    // TODO make special debug method to get line's grid positions
    return lineStore.getSolidLinesAt(point.x, point.y);
  }

  stepCollision(point, line, i, cPos) {
    super.stepCollision(point, line, i, cPos);
  }

  stepJoint(joint, i) {
    let hasCrashed = this.crashed;

    super.stepJoint(joint, i);

    if (!hasCrashed && this.crashed) {
      if (i === 0) {
        console.log('crashed because the sled broke!!2e1r');
      } else {
        console.log('bosh attempted The Cripple. now he crashed !@#$');
      }
    }

  }
}

module.exports = DebugRider;
