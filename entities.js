/* entities.js
 * Stuff that moves and reacts to physics
 */
'use strict';

var Vector = require('./vector');
var _ = require('lodash');

class Entity {

  constructor(id) {
    this.id = id;
    this.init = this;
  }

  clone(...copyStateArgs) {
    return _.create(this.init, this.copyState(...copyStateArgs));
  }

  copyState() {
    throw new Error('not implemented');
  }

  setState() {
    throw new Error('not implemented');
  }

}

/* Point
 *
 * public:
 * - x
 * - y
 * - step(gravity)
 *
 * private:
 * - vx
 * - vy
 * - dx
 * - dy
 */
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

/* Stick
 *
 * public:
 * - resolve()
 *
 * private:
 * - p
 * - q
 * - restLength
 */
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

/* BindStick
 *
 * public:
 * - resolve()
 *
 * private:
 * - p
 * - q
 * - restLength
 * - endurance
 */
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

/* RepelStick
 *
 * public:
 * - resolve()
 *
 * private:
 * - p
 * - q
 * - restLength
 */
class RepelStick extends Stick {

  shouldResolve() {
    return this.length < this.restLength;
  }

}

/* Stick
 *
 * public:
 * - resolve()
 *
 * private:
 * - p
 * - q
 * - restLength
 */
class ScarfStick extends Stick {

  doResolve() {
    let delta = this.getDelta().mulS(2);
    this.q.pos.add(delta);
  }

}

class Joint extends Constraint {

  constructor(id, s, t, p = null) {
    super(id);

    this.s = s;
    this.t = t;
    this.p = p;
  }

  copyState(s, t, p) {
    return {
      s: s || this.s.clone(),
      t: t || this.t.clone(),
      p: p || this.p ? this.p.clone() : null
    };
  }

}

// allow kramuals
class ClockwiseCrashJoint extends Joint {

  isClockwise() {
    return this.s.getVector().cross(this.t.getVector()) >= 0;
  }

  shouldResolve() {
    return false;
  }

  shouldCrash(crashed) {
    return crashed || !this.isClockwise();
  }

}

module.exports = {
  Entity,
  Point,
  Stick,
  BindStick,
  RepelStick,
  ScarfStick,
  ClockwiseCrashJoint
};
