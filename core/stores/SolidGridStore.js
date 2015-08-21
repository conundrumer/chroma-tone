'use strict';

import Store from './Store';
import { hashIntPair as getCellHash } from '../hashNumberPair';

export default class SolidGridStore extends Store {

  resetSolidLinesCache() {
    this.solidLinesCache = Object.create(null);
  }

  constructor(grid) {
    super();
    this.grid = grid;
    this.resetSolidLinesCache();
  }

  addLine(line) {
    if (line.isSolid) {
      let cellKeys = this.grid.addLine(line);
      this.resetSolidLinesCache();
      return cellKeys;
    }
    return [];
  }

  removeLine(line) {
    if (line.isSolid) {
      let cellKeys = this.grid.removeLine(line);
      this.resetSolidLinesCache();
      return cellKeys;
    }
    return [];
  }

  getSolidLinesAt(x, y, debug = false) { // eslint-disable-line no-unused-vars
    let cellPos = this.grid.getCellPos(x, y);

    let key = getCellHash(cellPos.x, cellPos.y);
    let lines = this.solidLinesCache[key];
    if (lines) {
      return lines;
    }
    lines = [];

    let addLine = line => lines.push(line);

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        let lines = this.grid.getLinesFromCell(i + cellPos.x, j + cellPos.y);
        for (let k = 0; k < lines.length; k++) {
          addLine(lines[k]);
        }
      }
    }

    this.solidLinesCache[key] = lines;

    return lines;
  }

  getCellKeysAt(x, y) {
    let cellPos = this.grid.getCellPos(x, y)
    let cellKeys = []
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        cellKeys.push(getCellHash(i + cellPos.x, j + cellPos.y))
      }
    }
    return cellKeys
  }
}
