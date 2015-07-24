
var _ = require('lodash');

var { getBox, inBounds } = require('./geo-utils');

// http://stackoverflow.com/a/13871379
function getCellHash(a, b) {
  var A = (a >= 0 ? 2 * a : -2 * a - 1);
  var B = (b >= 0 ? 2 * b : -2 * b - 1);
  var C = ((A >= B ? A * A + A + B : A + B * B) / 2);
  return a < 0 && b < 0 || a >= 0 && b >= 0 ? C : -C - 1;
}

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

// cell containing unique lines ordered by descending IDs
class OrderedCell extends Cell{

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

function cellsEqual(cell1, cell2) {
  return cell1.x === cell2.x && cell1.y === cell2.y;
}

class Grid {

  constructor(gridSize, isOrdered) {
    this.gridSize = gridSize;
    this.isOrdered = isOrdered;
    this.cells = Object.create(null);
    this.linesToCells = Object.create(null);
  }

  getLinesInBox(x1, y1, x2, y2, filterEdges = true) {
    if (x1 > x2) {
      [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
      [y1, y2] = [y2, y1];
    }
    // i'll use for-loops if this needs to be faster
    let tl = this.getCellPos(x1, y1);
    let br = this.getCellPos(x2, y2);
    let linesInBox = Object.create(null);
    // add lines from cells fully contained in box
    if (tl.x+1 < br.x && tl.y+1 < br.y) {
      _.forEach(_.range(tl.y+1, br.y), cy =>
        _.forEach(_.range(tl.x+1, br.x), cx =>
          _.forEach(this.getLinesFromCell(cx, cy), line =>
            linesInBox[line.id] = line
          )
        )
      );
    }
    let addLineIfInBox = filterEdges ? line => {
      if (!(line.id in linesInBox) && line.inBox(x1, y1, x2, y2)) {
        linesInBox[line.id] = line;
      }
    } : line => linesInBox[line.id] = line;
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

    return _.values(linesInBox);
  }

  getLinesInRadius(x, y, r) {
    // this could be faster but whatever
    return _.filter(this.getLinesInBox(x-r, y-r, x+r, y+r, false), line => line.inRadius(x, y, r));
  }

  getCell(k) {
    return this.cells[k];
  }

  getLinesFromCell(cellX, cellY) {
    let key = getCellHash(cellX, cellY);
    return (key in this.cells) ? this.cells[key].getLines() : [];
  }

  addLine(line) {
    // array of cell positions
    let cellsPos = this.getCellsPosFromLine(line);
    for (let i = 0; i < cellsPos.length; i++) {
      this.addLineToCell(line, cellsPos[i]);
    }
  }

  addLineToCell(line, cellPos) {
    let cellKey = getCellHash(cellPos.x, cellPos.y);

    if (!(cellKey in this.cells)) {
      this.cells[cellKey] = this.isOrdered ? new OrderedCell(cellPos) : new Cell(cellPos);
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

  removeLine(line) {
    _.forEach(this.linesToCells[line.id], cell => {
      cell.remove(line);
      if (cell.getLines().length === 0) {
        delete this.cells[cell.key];
      }
    });
    delete this.linesToCells[line.id];
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

class GridV62 extends Grid {

  getCellPosAndOffset(px, py) {
    let {x, y} = this.getCellPos(px, py);
    return {
      x: x,
      y: y,
      gx: px - this.gridSize * x,
      gy: py - this.gridSize * y
    };
  }

  getCellsPosFromLine(line) {
    var cellsPos = [];

    let cellPosStart = this.getCellPosAndOffset(line.p.x, line.p.y);
    let cellPosEnd = this.getCellPosAndOffset(line.q.x, line.q.y);

    cellsPos.push(cellPosStart);
    if (line.vec.x === 0 && line.vec.y === 0 || cellPosStart.x === cellPosEnd.x && cellPosStart.y === cellPosEnd.y) {
      return cellsPos; // done
    }

    let box = getBox(cellPosStart.x, cellPosStart.y, cellPosEnd.x, cellPosEnd.y);

    let getNextPos;

    if (line.vec.x === 0) {
      getNextPos = (l, x, y, dx, dy) => { return { x: x, y: y + dy }; };

    } else if (line.vec.y === 0) {
      getNextPos = (l, x, y, dx, dy) => { return { x: x + dx, y: y }; }; // eslint-disable-line no-unused-vars

    } else {
      getNextPos = this.getNextPos;
    }

    let addNextCell = (cellPos, pos) => {
      let d = this.getDelta(line, cellPos);

      let nextPos = getNextPos(line, pos.x, pos.y, d.x, d.y);
      let nextCellPos = this.getCellPosAndOffset(nextPos.x, nextPos.y);

      if (inBounds(nextCellPos, box)) {
        cellsPos.push(nextCellPos);
        addNextCell(nextCellPos, nextPos);
      }
    };

    addNextCell(cellPosStart, { x: line.p.x, y: line.p.y });

    return cellsPos;
  }

  getDelta(line, cellPos) {
    let dx, dy;
    if (cellPos.x < 0) {
      dx = (this.gridSize + cellPos.gx) * (line.vec.x > 0 ? 1 : -1);
    } else {
      dx = -cellPos.gx + (line.vec.x > 0 ? this.gridSize : -1);
    }
    if (cellPos.y < 0) {
      dy = (this.gridSize + cellPos.gy) * (line.vec.y > 0 ? 1 : -1);
    } else {
      dy = -cellPos.gy + (line.vec.y > 0 ? this.gridSize : -1);
    }
    return { x: dx, y: dy };
  }

  getNextPos(line, x, y, dx, dy) {
    let slope = line.vec.y / line.vec.x;
    let yNext = y + slope * dx;
    if (Math.abs(yNext - y) < Math.abs(dy)) {
      return {
        x: x + dx,
        y: yNext
      };
    }
    if (Math.abs(yNext - y) === Math.abs(dy)) {
      return {
        x: x + dx,
        y: y + dy
      };
    }
    return {
      x: x + line.vec.x * dy / line.vec.y,
      y: y + dy
    };
  }
}

class GridV61 extends GridV62 {

  getDelta(line, cellPos) {
    return {
      x: -cellPos.gx + (line.vec.x > 0 ? this.gridSize : -1),
      y: -cellPos.gy + (line.vec.y > 0 ? this.gridSize : -1)
    };
  }

  getNextPos(line, x, y, dx, dy) {
    let slope = line.vec.y / line.vec.x;
    let yIsThisBelowActualY0 = line.p.y - slope * line.p.x;
    let yDoesThisEvenWork = Math.round(slope * (x + dx) + yIsThisBelowActualY0);
    if (Math.abs(yDoesThisEvenWork - y) < Math.abs(dy)) {
      return {
        x: x + dx,
        y: yDoesThisEvenWork
      };
    }
    if (Math.abs(yDoesThisEvenWork - y) === Math.abs(dy)) {
      return {
        x: x + dx,
        y: y + dy
      };
    }
    return {
      x: Math.round((y + dy - yIsThisBelowActualY0) / slope),
      y: y + dy
    };
  }

}

module.exports = { Grid, GridV62, GridV61, getCellHash };
