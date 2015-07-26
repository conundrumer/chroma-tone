'use strict';

var Line = require('./Line');
var { SCENERY_LINE } = require('./LineTypes');

class SceneryLine extends Line {

  constructor(id, x1, y1, x2, y2) {
    super(id, x1, y1, x2, y2);
    this.c = this.getConstants();
  }

  get type() {
    return SCENERY_LINE;
  }
  get isSolid() {
    return false;
  }

}

module.exports = SceneryLine;
