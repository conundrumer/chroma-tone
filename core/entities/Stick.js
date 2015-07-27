'use strict';

var Vector = require('../Vector');
var Constraint = require('./Constraint');

class Stick extends Constraint {

  constructor (id, p, q) {
    super(id);

    this.p = p;
    this.q = q;
    this.restLength = this.length;

    // hmmmmmm should i bother with avoiding creation of vectors?
    this.tempVec = new Vector(0, 0);
  }

  get length() {
    return this.p.pos.distance(this.q.pos);
  }

  get diff() {
    let length = this.length;
    // prevent division by zero
    // this will allow interesting behavior but w/e
    if (length === 0) {
      return 0;
    }
    return (length - this.restLength) / length * 0.5;
  }

  getVector() {
    return this.tempVec.set(this.p.pos).subtract(this.q.pos);
  }

  getDelta() {
    return this.getVector().mulS(this.diff);
  }

  doResolve() {
    let delta = this.getDelta();
    this.p.pos.subtract(delta);
    this.q.pos.add(delta);
  }

  copyState(p, q) {
    return {
      p: p || this.p.clone(),
      q: q || this.q.clone(),
      tempVec: new Vector(0, 0)
    };
  }

}

module.exports = Stick;
