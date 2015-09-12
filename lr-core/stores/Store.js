'use strict';

const NotImplemented = () => new Error('Not implemented');

export default class Store {

  addLine(line) {
    throw NotImplemented();
  }

  removeLine(line) {
    throw NotImplemented();
  }

  getLines() {
    throw NotImplemented();
  }

  getLinesInRadius(x, y, r) {
    throw NotImplemented();
  }

  getLinesInBox(x1, y1, x2, y2) {
    throw NotImplemented();
  }

  getSolidLinesAt(x, y, debug = false) {
    throw NotImplemented();
  }

}
