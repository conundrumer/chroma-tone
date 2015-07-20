/* entities.js
 * Stuff that moves and reacts to physics
 */
'use strict';

class Entity {

  constructor(id) {
    this.id = id;
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

    // position
    this.x = x;
    this.y = y;
    // velocity
    this.dx = 0;
    this.dy = 0;
    // previous position for inertia
    this.vx = x;
    this.vy = y;

    this.friction = friction;
    this.airFriction = airFriction;
  }

  step(gravity) {
    this.dx = (this.x - this.vx) * this.airFriction + gravity.x;
    this.dy = (this.y - this.vy) * this.airFriction + gravity.y;
    this.vx = this.x;
    this.vy = this.y;
    this.x += this.dx;
    this.y += this.dy;
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
  }

  get dx() {
    return this.p.x - this.q.x;
  }

  get dy() {
    return this.p.y - this.q.y;
  }

  get length() {
    let dx = this.dx;
    let dy = this.dy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  get diff() {
    // prevent division by zero
    // this will allow interesting behavior but w/e
    if (this.length === 0) {
      return 0;
    }
    return (this.length - this.restLength) / this.length * 0.5;
  }

  // set dx(x) {}, set dy(x) {}, set length(x) {}, set diff(x) {},

  doResolve() {
    let dx = this.dx * this.diff;
    let dy = this.dy * this.diff;
    this.p.x -= dx;
    this.p.y -= dy;
    this.q.x += dx;
    this.q.y += dy;
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
    this.q.x += this.dx * this.diff * 2;
    this.q.y += this.dy * this.diff * 2;
  }

}

class Joint extends Constraint {

  constructor(id, s, t, p = null) {
    super(id);

    this.s = s;
    this.t = t;
    this.p = p;
  }

}

// allow kramuals
class ClockwiseCrashJoint extends Joint {

  isClockwise() {
    return this.s.dx * this.t.dy - this.s.dy * this.t.dx >= 0;
  }

  shouldResolve() {
    return false;
  }

  shouldCrash(crashed) {
    return crashed || !this.isClockwise();
  }

}

module.exports = {
  Point,
  Stick,
  BindStick,
  RepelStick,
  ScarfStick,
  ClockwiseCrashJoint
};
