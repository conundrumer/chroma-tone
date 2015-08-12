'use strict';

var getCellHash = require('../hashNumberPair').hashIntPair;

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
    let keys = Object.keys(this.lines);
    for (var i = keys.length - 1; i >= 0; i--) {
      keys[i] = this.lines[keys[i]];
    }
    return keys;
  }
}

module.exports = Cell;
