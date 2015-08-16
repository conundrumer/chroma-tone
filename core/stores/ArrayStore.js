'use strict';

import Store from './Store';
import _ from 'lodash';

export default class LineStore extends Store {
  constructor() {
    super();
    this.lines = [];
  }

  addLine(line) {
    this.lines.push(line);
  }

  removeLine(line) {
    this.lines = _.without(this.lines, line);
  }

  getLines() {
    return this.lines;
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
