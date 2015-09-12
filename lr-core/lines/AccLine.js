'use strict';

var SolidLine = require('./SolidLine');
var { ACC_LINE } = require('./LineTypes');

const ACC = 0.1;

class AccLine extends SolidLine {
  constructor(id, x1, y1, x2, y2, inv, lim) {
    super(id, x1, y1, x2, y2, inv, lim);
    this.c.acc = this.c.norm.clone().rotateRight().mulS(ACC * this.flip);
  }

  get type() {
    return ACC_LINE;
  }

  postCollide(perpComp, p) {
    p.prevPos.add(this.c.acc);
  }
}

module.exports = AccLine;
