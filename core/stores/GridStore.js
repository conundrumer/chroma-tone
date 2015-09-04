'use strict';

import _ from 'lodash';
import Store from './Store';
import { hashIntPair as getCellHash } from '../hashNumberPair';

// var Cell = require('./Cell');
// var OrderedCell = require('./OrderedCell');

function cellsEqual(cell1, cell2) {
  return cell1.x === cell2.x && cell1.y === cell2.y;
}

export default class GridStore extends Store {

  constructor(gridSize, cell) {
    super();
    this.gridSize = gridSize;
    this.makeCell = (cellPos) => new cell(cellPos);
    this.cells = Object.create(null);
    this.linesToCells = Object.create(null);
  }

  addLine(line) {
    // array of cell positions
    let cellsPos = this.getCellsPosFromLine(line);
    for (let i = 0; i < cellsPos.length; i++) {
      this.addLineToCell(line, cellsPos[i]);
    }
    return cellsPos.map(({x, y}) => getCellHash(x, y))
  }

  removeLine(line) {
    let cellsPos = this.linesToCells[line.id];
    _.forEach(cellsPos, cell => {
      cell.remove(line);
      if (cell.getLines().length === 0) {
        delete this.cells[cell.key];
      }
    });
    delete this.linesToCells[line.id];
    return cellsPos.map(({x, y}) => getCellHash(x, y))
  }

  getLinesInRadius(x, y, r) {
    // this could be faster but whatever
    return _.filter(this.getLinesInBox(x-r, y-r, x+r, y+r, false), line => line.inRadius(x, y, r));
  }

  getLinesInBox(x1, y1, x2, y2, filterEdges) {
    filterEdges = filterEdges || true
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
      [y1, y2] = [y2, y1];
    }
    let tl = this.getCellPos(x1, y1);
    let br = this.getCellPos(x2, y2);
    let linesInBox = Object.create(null);
    let lines = [];
    // add lines from cells fully contained in box
    if (tl.x+1 < br.x && tl.y+1 < br.y) {
      for (let cy = tl.y+1; cy < br.y; cy++) {
        for (let cx = tl.x+1; cx < br.x; cx++) {
          let linesInCell = this.getLinesFromCell(cx, cy);
          for (let i = linesInCell.length - 1; i >= 0; i--) {
            let line = linesInCell[i];
            if (!(line.id in linesInBox)) {
              linesInBox[line.id] = true;
              lines.push(line);
            }
          };
        }
      }
    }
    let addLineIfInBox = line => {
      if (!(line.id in linesInBox) && (!filterEdges || line.inBox(x1, y1, x2, y2))) {
        linesInBox[line.id] = true;
        lines.push(line);
      }
    };
    // add lines in cells under top and bottom edges
    _.forEach(_.range(tl.x, br.x+1), cx => {
      _.forEach(this.getLinesFromCell(cx, tl.y), addLineIfInBox);
      _.forEach(this.getLinesFromCell(cx, br.y), addLineIfInBox);
    });
    // add lines in cells under left and right edges, not including top and bottom
    _.forEach(_.range(tl.y+1, br.y), cy => {
      _.forEach(this.getLinesFromCell(tl.x, cy), addLineIfInBox);
      _.forEach(this.getLinesFromCell(br.x, cy), addLineIfInBox);
    });

    return lines;
  }

  getLinesFromCell(cellX, cellY) {
    let key = getCellHash(cellX, cellY);
    return (key in this.cells) ? this.cells[key].getLines() : [];
  }

  addLineToCell(line, cellPos) {
    let cellKey = getCellHash(cellPos.x, cellPos.y);

    if (!(cellKey in this.cells)) {
      this.cells[cellKey] = this.makeCell(cellPos);
    }

    if (!(line.id in this.linesToCells)) {
      this.linesToCells[line.id] = [];
    }

    let cell = this.cells[cellKey];

    if (!cell.has(line)) {
      cell.add(line);
      this.linesToCells[line.id].push(cell);
    }
  }

  getCellCor(x) {
    return Math.floor(x / this.gridSize);
  }

  getCellPos(x, y) {
    return {
      x: this.getCellCor(x),
      y: this.getCellCor(y)
    };
  }

  // digital differential analyzer
  getCellsPosFromLine(line) {
    let { x1, x2, y1, y2 } = line;
    if ( x1 === x2 && y1 === y2 || cellsEqual(this.getCellPos(x1, y1), this.getCellPos(x2, y2))) {
      return [ this.getCellPos(x1, y1) ];
    }
    let flip = (Math.abs(line.vec.y) > Math.abs(line.vec.x));
    if (flip) { // handle steep lines by temporarily flipping the axes
      [ x1, y1, x2, y2 ] = [ y1, x1, y2, x2 ];
    }
    if (x1 > x2) { // make sure the line goes from left to right
      [ x1, y1, x2, y2 ] = [ x2, y2, x1, y1 ];
    }
    let cellPosStart = this.getCellPos(x1, y1);
    let cellPosEnd = this.getCellPos(x2, y2);
    let slope = (y2 - y1) / (x2 - x1);
    let getY = (x) => y1 + slope * (x - x1);

    let cellsPos = [ cellPosStart ];
    let prevCell = cellsPos[0];
    let addNextCell = (nextCell) => {
      if (prevCell.x !== nextCell.x && prevCell.y !== nextCell.y) {
        cellsPos.push({ x: nextCell.x-1, y: nextCell.y });
      }
      cellsPos.push(nextCell);
      prevCell = nextCell;
    };

    for (let cx = cellPosStart.x + 1; cx < cellPosEnd.x + 1; cx++) {
      let nextCell = { x: cx, y: Math.floor(getY(cx * this.gridSize) / this.gridSize) };
      addNextCell(nextCell);
    }
    addNextCell(cellPosEnd);

    if (cellsEqual(cellsPos[cellsPos.length-1], cellsPos[cellsPos.length-2])) {
      cellsPos.pop();
    }

    if (flip) {
      for (let i = 0; i < cellsPos.length; i++) {
        let cell = cellsPos[i];
        let { x, y } = cell;
        cell.x = y;
        cell.y = x;
      }
    }

    return cellsPos;
  }

}
