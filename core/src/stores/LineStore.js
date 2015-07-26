'use strict';

var _ = require('lodash');

class LineStore {
  constructor() {
    // if performance problems, will make this array sorted
    this.lines = [];
  }

  addLine(line) {
    this.lines.push(line);
  }

  removeLine(line) {
    this.lines = _.without(this.lines, line);
  }

  // returns an array of lines in this bounding box or radius
  getLines(x1, y1, x2, y2) {
    if (y2 === undefined) {
      let r = x2;
      return this.getLinesInRadius(x1, y1, r);
    }
    return this.getLinesInBox(x1, y1, x2, y2);
  }

  getLinesInRadius(x, y, r) {
    return _.filter(this.lines, line => line.inRadius(x, y, r));
  }

  getLinesInBox(x1, y1, x2, y2) {
    return _.filter(this.lines, line => line.inBox(x1, y1, x2, y2));
  }

  // the ordering of the lines affects the physics
  getSolidLinesAt(x, y, debug = false) { // eslint-disable-line no-unused-vars
    return _.filter(this.lines, line => line.isSolid);
  }

}

module.exports = LineStore;
