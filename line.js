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
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.flipped = false;
  }

  // virtual methods
  get type() {
    return undefined;
  }
  get isSolid() {
    return undefined;
  }

  get flip() {
    return 1;
  }

  get dx() {
    return this.x2 - this.x1;
  }
  get dy() {
    return this.y2 - this.y1;
  }
  // get cross() {
  //     return this.dy * this.x1 - this.dx * this.y1;
  // }
  get sqrDst() {
    return Math.pow(this.dx, 2) + Math.pow(this.dy, 2);
  }
  get invSqrDst() {
    return 1 / this.sqrDst;
  }
  get dst() {
    return Math.sqrt(this.sqrDst);
  }
  get invDst() {
    return 1 / this.dst;
  }
  get nx() {
    return this.dy * this.invDst * -this.flip;
  }
  get ny() {
    return this.dx * this.invDst * this.flip;
  }
  // get x() {
  //   return this.x1 + this.dx * 0.5;
  // }
  // get y() {
  //   return this.y1 + this.dy * 0.5;
  // }
  // get hx() {
  //   return Math.abs(this.dx) * 0.5;
  // }
  // get hy() {
  //   return Math.abs(this.dy) * 0.5;
  // }
  get extension() {
    return Math.min(MIN_EXTENSION_RATIO, MAX_FORCE_LENGTH / this.dst);
  }
  get leftBound() {
    return this.leftExtended ? -this.extension : 0;
  }
  get rightBound() {
    return this.rightExtended ? 1 + this.extension : 1;
  }

  // legacy thing, to remove
  set lim(extended) {
    this.leftExtended = !!(LEFT_EXTENDED & extended);
    this.rightExtended = !!(RIGHT_EXTENDED & extended);
  }
  get lim() {
    return (this.leftExtended << 0) | (this.rightExtended << 1);
  }

  ox(p) {
    return p.x - this.x1;
  }

  oy(p) {
    return p.y - this.y1;
  }

  // perpendicular component
  perpComp(p) {
    return this.nx * this.ox(p) + this.ny * this.oy(p);
  }

  // normalized parallel component
  // or closest relative position on the line to the point
  linePos(p) {
    return (this.ox(p) * this.dx + this.oy(p) * this.dy) * this.invSqrDst;
  }
}

class SolidLine extends Line {
  constructor(id, x1, y1, x2, y2, inv, lim) {
    super(id, x1, y1, x2, y2);
    this.flipped = inv;
    this.lim = lim === undefined ? 0 : lim;
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

  shouldCollide(p) {
    let pntDirection = p.dx * this.nx + p.dy * this.ny;
    let perpComp = this.perpComp(p);
    let linePos = this.linePos(p);

    let pointMovingIntoLine = pntDirection > 0;
    let pointInForceBounds = perpComp > 0 && perpComp < MAX_FORCE_LENGTH &&
      linePos >= this.leftBound && linePos <= this.rightBound;

    return pointMovingIntoLine && pointInForceBounds;
  }

  doCollide(p) {
    // perpendicular component
    var perpComp = this.perpComp(p);
    p.x -= perpComp * this.nx;
    p.y -= perpComp * this.ny;
    p.vx += this.ny * p.friction * perpComp * (p.vx < p.x ? 1 : -1);
    p.vy -= this.nx * p.friction * perpComp * (p.vy < p.y ? -1 : 1);

  }

  postCollide(p) {
    return; // do nothing
  }

  collide(p) {
    if (this.shouldCollide(p)) {
      this.doCollide(p);
      this.postCollide(p);
      return true;
    } // end if
    return false;
  }


}
class AccLine extends SolidLine {

  get type() {
    return LINE.ACC;
  }

  get accx() {
    return this.ny * ACC * -this.flip;
  }
  get accy() {
    return this.nx * ACC * this.flip;
  }

  postCollide(p) {
    p.vx += this.accx;
    p.vy += this.accy;
  }
}

class FloorScenery extends Line {

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
