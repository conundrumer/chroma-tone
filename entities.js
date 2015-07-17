/* entities.js
 * Stuff that moves and reacts to physics
 */
'use strict';

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
class Point {

  constructor(x, y, friction, airFriction) {

    // TODO: should I use point IDs???
    // this.id = id++; // debug

    // position
    this.x = x;
    this.y = y;
    // velocity
    this.dx = 0;
    this.dy = 0;
    // previous position for inertia
    this.vx = x;
    this.vy = y;

    this.friction = friction || 0;
    this.airFriction = (airFriction !== undefined) ? airFriction : 1;
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
class Stick {

  constructor (p, q) {
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
    return (this.length - this.restLength) / this.length * 0.5;
  }

  // set dx(x) {}, set dy(x) {}, set length(x) {}, set diff(x) {},

  shouldCrash(crashed) {
    return crashed;
  }

  shouldResolve() {
    return true;
  }

  doResolve() {
    let dx = this.dx * this.diff;
    let dy = this.dy * this.diff;
    this.p.x -= dx;
    this.p.y -= dy;
    this.q.x += dx;
    this.q.y += dy;
  }

  resolve(crashed) {
    if (this.shouldResolve(crashed)) {
      this.doResolve();
    }
    return this.shouldCrash(crashed);
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

  constructor(p, q, endurance) {
    super(p, q);
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

module.exports = {
  Point: Point,
  Stick: Stick,
  BindStick: BindStick,
  RepelStick: RepelStick,
  ScarfStick: ScarfStick
};
