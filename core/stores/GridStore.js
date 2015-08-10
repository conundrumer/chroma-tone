'use strict';

var LineStore = require('./LineStore');
var Grid = require('./Grid');
var GridV62 = require('./GridV62');
var getCellHash = require('./getCellHash');

// TODO: use composition instead of inheritance
class GridStore extends LineStore {
  constructor() {
    super();

    // for solid lines
    this.solidGrid = new GridV62(GridStore.GRID_SIZE, true);

    // for all lines
    // darn there was a clever data structure for this stuff what was it
    // i think it was 2d sorted arrays?
    // i'll do it later
    this.grid = new Grid(GridStore.GRID_SIZE * 4, false);

    // for some reason, querying the grid is time consuming, so caching improves performance
    this.resetSolidLinesCache();
  }

  addLine(line) {
    super.addLine(line);

    this.grid.addLine(line);

    if (line.isSolid) {
      this.solidGrid.addLine(line);
      this.resetSolidLinesCache();
    }
  }

  removeLine(line) {
    super.removeLine(line);

    this.grid.removeLine(line);

    if (line.isSolid) {
      this.solidGrid.removeLine(line);
      this.resetSolidLinesCache();
    }
  }

  getSolidLinesAt(x, y, debug = false) { // eslint-disable-line no-unused-vars
    let cellPos = this.solidGrid.getCellPos(x, y);

    let key = getCellHash(cellPos.x, cellPos.y);
    let lines = this.solidLinesCache[key];
    if (lines) {
      return lines;
    }
    lines = [];

    let addLine = line => lines.push(line);

    // normally i would avoid for loops but lots of iterations here
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let lines = this.solidGrid.getLinesFromCell(i + cellPos.x, j + cellPos.y);
        for (let k = 0; k < lines.length; k++) {
          addLine(lines[k]);
        }
      }
    }

    this.solidLinesCache[key] = lines;

    return lines;
  }

  getLines(cPos) {
    return this.solidGrid.getLinesFromCell(cPos);
  }

  resetSolidLinesCache() {
    this.solidLinesCache = Object.create(null);
  }

  getLinesInRadius(x, y, r) {
    return this.grid.getLinesInRadius(x, y, r);
  }

  getLinesInBox(x1, y1, x2, y2) {
    let [w, h] = [x2 - x1, y2 - y1];
    // i'll do this for now until i implement kd trees
    if (((w / this.grid.gridSize) | 0) * ((h / this.grid.gridSize) | 0) > 200) {
      return super.getLinesInBox(x1, y1, x2, y2);
    }
    return this.grid.getLinesInBox(x1, y1, x2, y2);
  }

}

GridStore.GRID_SIZE = 14;

module.exports = GridStore;
