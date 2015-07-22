/*
 * line.js
 * The lines of Line Rider
 * mostly solid and collides with points
 * p1: left point
 * p2: right point
 * with the vector formed by pq pointing to the right,
 * floor direction of lines (not flipped) is downwards (cw)
 */

'use strict';

var Vector = require('./vector');

const
  // physics
  MAX_FORCE_LENGTH = 10,
  ACC = 0.1,
  MIN_EXTENSION_RATIO = 0.25,
  // line extensions
  // NOT_EXTENDED = 0,
  LEFT_EXTENDED = 1, // bit masking!
  RIGHT_EXTENDED = 2,
  // BOTH_EXTENDED = 3,
  // line types
  LINE = {
    SOLID: 0,
    ACC: 1,
    SCENERY: 2
  };

class Line {
  constructor(id, x1, y1, x2, y2) {
    this.id = id;
    this.p = new Vector(x1, y1);
    this.q = new Vector(x2, y2);
    this.flipped = false;
  }

  // virtual methods
  get type() {
    return undefined;
  }
  get isSolid() {
    return undefined;
  }

  getConstants() {
    let vec = this.q.clone().subtract(this.p);
    let lengthSq = vec.lengthSq();
    let invLengthSq = 1 / lengthSq;
    let length = Math.sqrt(lengthSq);
    let invLength = 1 / length;
    let norm = vec.clone().rotateRight().mulS(invLength * this.flip);
    let extension = Math.min(MIN_EXTENSION_RATIO, MAX_FORCE_LENGTH / length);
    let leftBound = this.leftExtended ? -extension : 0;
    let rightBound = this.rightExtended ? 1 + extension : 1;
    return { vec, norm, invLengthSq, length, extension, leftBound, rightBound };
  }

  get x1() {
    return this.p.x;
  }
  get y1() {
    return this.p.y;
  }
  get x2() {
    return this.q.x;
  }
  get y2() {
    return this.q.y;
  }

  get flip() {
    return 1;
  }

  get vec() {
    return this.c.vec;
  }
  get norm() {
    return this.c.norm;
  }
  get length() {
    return this.c.length;
  }

  get leftBound() {
    return this.leftExtended ? -this.c.extension : 0;
  }
  get rightBound() {
    return this.rightExtended ? 1 + this.c.extension : 1;
  }

  // legacy thing, to remove
  set lim(extended) {
    this.leftExtended = !!(LEFT_EXTENDED & extended);
    this.rightExtended = !!(RIGHT_EXTENDED & extended);
  }
  get lim() {
    return (this.leftExtended << 0) | (this.rightExtended << 1);
  }

  get extended() {
    return this.lim;
  }

  offset(p) {
    Line.tempVec.set(p.pos).subtract(this.p);
    return Line.tempVec;
  }

  // perpendicular component
  perpComp(offset) {
    return this.c.norm.dot(offset);
  }

  // normalized parallel component
  // or closest relative position on the line to the point
  // this is the slowest function
  // so maybe come up with a faster boundary checking algo
  linePos(offset) {
    return this.c.vec.dot(offset) * this.c.invLengthSq;
  }

  inCircle(x, y, r) {
    throw new Error('not implemented');
  }

  inBox(x1, y1, x2, y2) {
    throw new Error('not implemented');
  }

}
Line.tempVec = new Vector(0, 0);

class SolidLine extends Line {
  constructor(id, x1, y1, x2, y2, inv, lim) {
    super(id, x1, y1, x2, y2);
    this.flipped = inv;
    this.lim = lim === undefined ? 0 : lim;
    this.c = this.getConstants();
  }

  get type() {
    return LINE.SOLID;
  }
  get isSolid() {
    return true;
  }

  get flip() {
    return this.flipped ? -1 : 1;
  }

  shouldCollide(perpComp, linePos, p) {
    let pntDirection = this.c.norm.dot(p.vel);

    let pointMovingIntoLine = pntDirection > 0;
    let pointInForceBounds = perpComp > 0 && perpComp < MAX_FORCE_LENGTH &&
      linePos >= this.c.leftBound && linePos <= this.c.rightBound;

    return pointMovingIntoLine && pointInForceBounds;
  }

  doCollide(perpComp, p) {
    let vec = Line.tempVec;

    vec.set(this.c.norm).mulS(perpComp);
    p.pos.subtract(vec);

    // move the previous point closer to reduce inertia and simulate friction
    // retain multiplication order because order matters
    vec.set(this.c.norm).rotateLeft().mulS(p.friction).mulS(perpComp).mulV({
      x: p.prevPos.x < p.pos.x ? 1 : -1,
      y: p.prevPos.y < p.pos.y ? -1 : 1
    });
    p.prevPos.add(vec);
  }

  postCollide(perpComp, p) {
    return; // do nothing
  }

  collide(p) {
    let offset = this.offset(p);
    var perpComp = this.perpComp(offset);
    var linePos = this.linePos(offset);
    if (this.shouldCollide(perpComp, linePos, p)) {
      this.doCollide(perpComp, p);
      this.postCollide(perpComp, p);
      return true;
    }
    return false;
  }


}
class AccLine extends SolidLine {
  constructor(id, x1, y1, x2, y2, inv, lim) {
    super(id, x1, y1, x2, y2, inv, lim);
    this.c.acc = this.c.norm.clone().rotateRight().mulS(ACC * this.flip);
  }

  get type() {
    return LINE.ACC;
  }

  postCollide(perpComp, p) {
    p.prevPos.add(this.c.acc);
  }
}

class FloorScenery extends Line {

  constructor(id, x1, y1, x2, y2) {
    super(id, x1, y1, x2, y2);
    this.c = this.getConstants();
  }

  get type() {
    return LINE.SCENERY;
  }
  get isSolid() {
    return false;
  }

}

module.exports = {
  LINE: LINE,
  SolidLine: SolidLine,
  AccLine: AccLine,
  SceneryLine: FloorScenery
};
