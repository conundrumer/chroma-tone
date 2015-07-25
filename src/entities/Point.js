'use strict';

var Entity = require('./Entity');
var Vector = require('../Vector');

class Point extends Entity {

  constructor(id, x, y, friction = 0, airFriction = 1) {
    super(id);

    this.pos = new Vector(x, y);
    this.prevPos = new Vector(x, y);
    this.vel = new Vector(0, 0);

    this.friction = friction;
    this.airFriction = airFriction;
  }

  get x() {
    return this.pos.x;
  }

  get y() {
    return this.pos.y;
  }

  step(gravity) {
    this.vel.set(this.pos).subtract(this.prevPos).mulS(this.airFriction).add(gravity);
    this.prevPos.set(this.pos);
    this.pos.add(this.vel);
  }

  copyState() {
    return {
      pos: this.pos.clone(),
      prevPos: this.prevPos.clone(),
      vel: this.vel.clone()
    };
  }

  setState(state) {
    this.pos.set(state.pos);
    this.prevPos.set(state.prevPos);
    this.vel.set(state.vel);
  }

}

module.exports = Point;
