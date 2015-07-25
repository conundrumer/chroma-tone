'use strict';

var Entity = require('./Entity');

class Constraint extends Entity {

  shouldCrash(crashed) {
    return crashed;
  }

  shouldResolve() {
    return true;
  }

  doResolve() {
    throw new Error('Not implemented');
  }

  resolve(crashed) {
    if (this.shouldResolve(crashed)) {
      this.doResolve();
    }
    return this.shouldCrash(crashed);
  }

}

module.exports = Constraint;
