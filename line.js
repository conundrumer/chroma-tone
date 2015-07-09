/*
 * line.js
 * The lines of Line Rider
 * mostly solid and collides with points
 * p: left point
 * q: right point
 * with the vector formed by pq pointing to the right,
 * floor direction of lines (not flipped) is downwards (cw)
 */

var _ = require('lodash');

var GeoUtils = require('./geo-utils');

var
  dist = GeoUtils.dist,
  getBox = GeoUtils.getBox;

const
  // physics
  MAX_NORMAL_FORCE_LENGTH = 10,
  ACC = 0.1,
  MIN_EXTENSION_RATIO = 0.25,
  // line extensions
  NOT_EXTENDED = 0,
  LEFT_EXTENDED = 1, // bit masking!
  RIGHT_EXTENDED = 2,
  BOTH_EXTENDED = 3,
  // line types
  LINE = {
    SOLID: 0,
    ACC: 1,
    SCENERY: 2
  };

/* Line
 *
 * public
 * - x1
 * - y1
 * - x2
 * - y2
 * - inCircle(x, y, r)
 * - inBox(x1, y1, x2, y2)
 */
function Line(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.flipped = false;
}
Line.prototype = {

  get dx() {
    return this.x2 - this.x1;
  },
  get dy() {
    return this.y2 - this.y1;
  },

  // get cross() {
  //   return this.x1 * this.y2 - this.x2 * this.y1;
  // },

  get length() {
    return dist(this.x1, this.y1, this.x2, this.y2);
  },

  // normalized normal vector pointing towards the floor
  get nx() {
    return this.dy / this.length * (this.flipped ? 1 : -1);
  },
  get ny() {
    return this.dx / this.length * (this.flipped ? -1 : 1);
  },

  // offset vector of p from the line's left point
  ox(p) {
    return p.x - this.x1;
  },
  oy(p) {
    return p.y - this.y1;
  },

  // dot product of p and normal vector
  // perpendicular component (positive if inside the floor)
  perpPos(p) {
    return this.nx * this.ox(p) + this.ny * this.oy(p);
  },

  // the normalized parallel component of p
  // from 0 to 1, left to right, along the length of the line
  linePos(p) {
    return (this.ox(p) * this.dx + this.oy(p) * this.dy) / (this.length * this.length);
  },

  // true if part or all of the line is in the given circle
  inCircle(x, y, r) {
    return (
         dist(this.x1, this.y1, x, y) <= r
      || dist(this.x2, this.y2, x, y) <= r
      || Math.abs(this.perpPos({ x: x, y: y })) <= r
    );
  },

  // true if part or all of the line is in the given box
  // http://stackoverflow.com/a/293052
  inBox(x1, y1, x2, y2) {
    let box = getBox(x1, x2, y1, y2);
    let lineSides = box.corners.map( c => this.perpPos(c) );

    if (lineSides.every( side => side > 0 ) || lineSides.every( side => side < 0 )) {
      return false;
    }

    return !(
         this.x1 > box.right && this.x2 > box.right
      || this.x1 < box.left && this.x2 < box.left
      || this.y1 > box.bottom && this.y2 > box.bottom
      || this.y1 < box.top && this.y2 < box.top
    );
  }

};

/* SolidLine
 * - this is the blue normal line
 *
 * public
 * - x1
 * - y1
 * - x2
 * - y2
 * - type
 * - flipped
 * - leftLine
 * - rightLine
 * - inCircle(x, y, r)
 * - inBox(x1, y1, x2, y2)
 * - collide(p)
 * - type
 * - normalForceBounds (for debugging)
 */
function SolidLine(x1, y1, x2, y2, flipped, extended) {
  Line.call(this, x1, y1, x2, y2);
  this.flipped = flipped || false;
  // this.extended = extended || NOT_EXTENDED;
  this.setExtended(extended || NOT_EXTENDED);
  this.leftLine = null;
  this.rightLine = null;
}
SolidLine.prototype = _.create(Line.prototype, {
  constructor: SolidLine,

  type: LINE.SOLID,

  // ratio of line length
  // max absolute length: 10
  // ^ this happens when the line length is at least 40
  get extension() {
    Math.min(MIN_EXTENSION_RATIO, MAX_NORMAL_FORCE_LENGTH / this.length);
  },

  // wtf why doesn't this setter work
  // set extended(extended) {
  //   this.extendedType = extended;
  //   this.leftBound = (LEFT_EXTENDED & extended) ? -this.extension : 0;
  //   this.rightBound = (RIGHT_EXTENDED & extended) ? 1 + this.extension : 1;
  // },
  setExtended(extended) {
    this.extendedType = extended;
    this.leftBound = (LEFT_EXTENDED & extended) ? -this.extension : 0;
    this.rightBound = (RIGHT_EXTENDED & extended) ? 1 + this.extension : 1;
  },

  // aka g-well, returns the area under the influence of the normal force
  // returns { left, right, maxNormalForce }
  // where left and right are the ends of the line + extension
  // and maxNormalForce is a vector representing the longest possible normal force
  get normalForceBounds() {
    return {
      left: {
        x: this.x1 + this.dx * this.leftBound,
        y: this.y1 + this.dy * this.leftBound
      },
      right: {
        x: this.x2 + this.dx * (this.rightBound - 1),
        y: this.y2 + this.dy * (this.rightBound - 1)
      },
      maxNormalForce: {
        // point this upwards, not downwards into the floor
        x: -MAX_NORMAL_FORCE_LENGTH * this.nx,
        y: -MAX_NORMAL_FORCE_LENGTH * this.yx
      }
    };
  },

  shouldCollide(p) {
    let pDirection = p.dx * this.nx + p.dy * this.ny;
    let perpPos = this.perpPos(p);
    let linePos = this.linePos(p);

    let movingIntoLine = pDirection > 0;
    let otherSideOfLine = perpPos > 0;
    let withinDistance = perpPos < MAX_NORMAL_FORCE_LENGTH;
    let withinBounds = (linePos >= this.leftBound) && (linePos <= this.rightBound);

    return movingIntoLine && otherSideOfLine && withinDistance && withinBounds;
  },

  doCollide(p) {
    let perpPos = this.perpPos(p);
    // remove perpendicular component
    p.x -= perpPos * this.nx;
    p.y -= perpPos * this.ny;
    // add friction based on parallel component, point friction, force, and direction
    p.vx += this.ny * p.friction * perpPos * (p.vx < p.x ? 1 : -1);
    p.vy -= this.nx * p.friction * perpPos * (p.vy < p.y ? -1 : 1);
  },
  postCollide(p) {
    return; // do nothing
  },

  collide(p) {
    if (this.shouldCollide(p)) {
      this.doCollide(p);
      this.postCollide(p);
      return true;
    }
    return false;
  }
});

/* AccLine
 * - this is the red acceleration line
 *
 * public
 * - x1
 * - y1
 * - x2
 * - y2
 * - type
 * - flipped
 * - inCircle(x, y, r)
 * - inBox(x1, y1, x2, y2)
 * - collide(p)
 * - normalForceBounds (for debugging)
 */
function AccLine(x1, y1, x2, y2, flipped, extended, acc) {
  SolidLine.call(this, x1, y1, x2, y2, flipped, extended);
  this.acc = acc || ACC;
}
AccLine.prototype = _.create(SolidLine.prototype, {
  constructor: AccLine,

  type: LINE.ACC,

  // wtf why don't these getters work???
  // get accx() {
  //   return this.acc * this.dx / this.length;
  // },

  // get accy() {
  //   return this.acc * this.dy / this.length;
  // },

  postCollide(p) {
    // p.vx += this.accx;
    // p.vy += this.accy;
    p.vx -= this.acc * this.dx / this.length;
    p.vy -= this.acc * this.dy / this.length;
  }
});

/* SceneryLine
 * - this is the green scenery line
 *
 * public
 * - x1
 * - y1
 * - x2
 * - y2
 * - type
 * - inCircle(x, y, r)
 * - inBox(x1, y1, x2, y2)
 */
function SceneryLine(x1, y1, x2, y2) {
  Line.call(this, x1, y1, x2, y2);
}
SceneryLine.prototype = _.create(Line.prototype, {
  constructor: SceneryLine,

  type: LINE.SCENERY
});

module.exports = {
  LINE: LINE,
  SolidLine: SolidLine,
  AccLine: AccLine,
  SceneryLine: SceneryLine
};
