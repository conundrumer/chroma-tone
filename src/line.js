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
    Line.tempVec.set(p).subtract(this.p);
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

  // true if part or all of the line is in the given radius
  inRadius(x, y, r) {
    let c = {x, y};
    let offset = this.offset(c);
    let perpComp = this.perpComp(offset);
    // not within distance of infinite line
    if (Math.abs(perpComp) > r) {
      return false;
    }
    let linePos = this.linePos(offset);
    // within boundaries of endpoints or radius of either endpoints
    if (linePos > 0 && linePos < 1) {
      return true;
    }
    let rSq = r * r;
    // within radius of either endpoints
    return this.p.distanceSq(c) < rSq || this.q.distanceSq(c) < rSq;
  }

  getSide(x, y) {
    return this.perpComp(this.offset({x, y})) > 0;
  }

  // true if part or all of the line is in the given box
  // http://stackoverflow.com/a/293052
  inBox(x1, y1, x2, y2) {
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
      [y1, y2] = [y2, y1];
    }
    let {p, q} = this;
    // both endpoints are totally on one side of the box
    if ( p.x < x1 && q.x < x1 || p.x > x2 && q.x > x2
      || p.y < y1 && q.y < y1 || p.y > y2 && q.y > y2) {
      return false;
    }
    // any endpoints are totally inside the box
    if ( (x1 < p.x && p.x < x2) && (y1 < p.y && p.y < y2)
      || (x1 < q.x && q.x < x2) && (y1 < q.y && q.y < y2)) {
      return true;
    }
    // any corners of box are on different sides of the line
    let side = this.getSide(x1, y1);
    return (side !== this.getSide(x2, y1) || side !== this.getSide(x1, y2)
      || side !== this.getSide(x2, y2));
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
