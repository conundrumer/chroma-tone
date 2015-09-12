'use strict';

import Store from './Store';
import Immutable from 'immutable';

export default class MapStore extends Store {
  constructor() {
    super();
    this.lineMap = Immutable.Map();
  }

  addLine(line) {
    this.lineMap = this.lineMap.set(line.id, line);
  }

  removeLine(line) {
    this.lineMap = this.lineMap.delete(line.id);
  }

  getLineByID(id) {
    return this.lineMap.get(id);
  }

  getLines() {
    return this.lineMap.toArray();
  }

  getLinesInRadius(x, y, r) {
    return this.lineMap.filter( line => line.inRadius(x, y, r)).toArray();
  }

  getLinesInBox(x1, y1, x2, y2) {
    return this.lineMap.filter( line => line.inBox(x1, y1, x2, y2)).toArray();
  }

  // the ordering of the lines affects the physics
  getSolidLinesAt(x, y, debug = false) { // eslint-disable-line no-unused-vars
    return this.lineMap.filter(this.lines, line => line.isSolid);
  }

  getCellKeysAt() {
    return []
  }

}
