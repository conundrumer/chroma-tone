'use strict';

var _ = require('lodash');
var getCellHash = require('./getCellHash');

// cell containing unordered unique lines
class Cell {

  constructor(cellPos) {
    this.x = cellPos.x;
    this.y = cellPos.y;
    this.lines = Object.create(null);
    this.key = getCellHash(cellPos.x, cellPos.y);
  }

  has(line) {
    return line.id in this.lines;
  }

  add(line) {
    this.lines[line.id] = line;
  }

  remove(line) {
    delete this.lines[line.id];
  }

  getLines() {
    return _.values(this.lines);
  }
}

module.exports = Cell;
