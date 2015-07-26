'use strict';

var _ = require('lodash');

var Cell = require('./Cell');

// cell containing unique lines ordered by descending IDs
class OrderedCell extends Cell {

  constructor(cellPos) {
    super(cellPos);
    // if memory is a problem, replace lines with orderedLines
    // this.lines = [];
    this.orderedLines = [];
  }

  getIndexOf(line) {
    return _.sortedIndex(this.orderedLines, line, l => -l.id);
  }

  add(line) {
    if (!this.has(line)) {
      super.add(line);
      let index = this.getIndexOf(line);
      this.orderedLines.splice(index, 0, line);
    }
  }

  remove(line) {
    if (this.has(line)) {
      super.remove(line);
      let index = this.getIndexOf(line);
      _.pullAt(this.orderedLines, index);
    }
  }

  getLines() {
    return this.orderedLines;
  }
}

module.exports = OrderedCell;
