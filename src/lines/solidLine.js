'use strict';

var Line = require('./Line');
var { SOLID_LINE } = require('./LineTypes');

class SolidLine extends Line {
  constructor(id, x1, y1, x2, y2, inv, lim) {
    super(id, x1, y1, x2, y2);
    this.flipped = inv;
    this.lim = lim === undefined ? 0 : lim;
    this.c = this.getConstants();
  }

  get type() {
    return SOLID_LINE;
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
    let pointInForceBounds = perpComp > 0 && perpComp < Line.MAX_FORCE_LENGTH &&
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

  postCollide(perpComp, p) { // eslint-disable-line no-unused-vars
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

module.exports = SolidLine;
