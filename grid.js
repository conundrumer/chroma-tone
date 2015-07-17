// grid data structure for space partitioning of lines

var _ = require('lodash');

var { getBox, inBounds } = require('./geo-utils');

function getCellKey(cellPos) {
  return cellPos.x + '_' + cellPos.y;
}

// cell containing unordered unique lines
class Cell {

  constructor(cellPos) {
    this.x = cellPos.x;
    this.y = cellPos.y;
    this.lines = Object.create(null);
  }

  get key() {
    return getCellKey(this);
  }

  has(line) {
    return !!this.lines[line.id];
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
    this.lines = [];
  }


  getIndexOf(line) {
    return _.sortedIndex(this.lines, line, l => -l.id);
  }

  has(line) {
    return this.lines[this.getIndexOf(line)] === line;
  }

  add(line) {
    let index = this.getIndexOf(line);
    if (this.lines[index] !== line) {
      this.lines.splice(index, 0, line);
    }
  }

  remove(line) {
    let index = this.getIndexOf(line);
    if (this.lines[index] === line) {
      _.pullAt(this.lines, index);
    }
  }

  getLines() {
    return this.lines;
  }
}

class Grid {

  constructor(gridSize, isOrdered) {
    this.gridSize = gridSize;
    this.isOrdered = isOrdered;
    this.cells = Object.create(null);
    this.linesToCells = Object.create(null);
  }

  getLinesFromCell(cellPos) {
    let cell = this.cells[getCellKey(cellPos)];
    if (cell === undefined) {
      return [];
    }
    return cell.getLines();
  }

  addLine(line) {
    // array of cell positions
    let cellsPos = this.getCellsPosFromLine(line);
    cellsPos.forEach( cellPos => this.addLineToCell(line, cellPos) );
  }

  addLineToCell(line, cellPos) {
    let cellKey = getCellKey(cellPos);

    if (this.cells[cellKey] === undefined) {
      this.cells[cellKey] = this.isOrdered ? new OrderedCell(cellPos) : new Cell(cellPos);
    }

    if (this.linesToCells[line.id] === undefined) {
      this.linesToCells[line.id] = [];
    }

    let cell = this.cells[cellKey];

    if (!cell.has(line)) {
      cell.add(line);
      this.linesToCells[line.id].push(cell);
    }
  }

  removeLine(line) {
    this.linesToCells[line.id].forEach( cell => {
      cell.remove(line);
      if (cell.getLines().length === 0) {
        delete this.cells[cell.key];
      }
    });
    delete this.linesToCells[line.id];
  }

  getCellPos(px, py) {
    return {
      x: Math.floor(px / this.gridSize),
      y: Math.floor(py / this.gridSize)
    };
  }

  // digital differential analyzer
  getCellsPosFromLine(line) {
    let { x1, y1, x2, y2 } = line;
    if ( x1 === x2 && y1 === y2 || _.eq(this.getCellPos(x1, y1), this.getCellPos(x2, y2))) {
      return [ this.getCellPos(x1, y1) ];
    }
    let flip = (Math.abs(line.dy) > Math.abs(line.dx));
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

    return _(_.range(cellPosStart.x + 1, cellPosEnd.x + 1)) // grid lines not grid cells
      .map( cellX => { // get initial cellsPos
        return { x: cellX, y: Math.floor(getY(cellX * this.gridSize) / this.gridSize) };
      })
      .unshift(cellPosStart).push(cellPosEnd) // add first cell and last cell
      .map( (cellPos, i, cellsPos) => // add cells missing from vertical crossings
        (i > 0 && cellsPos[i-1].x !== cellPos.x && cellsPos[i-1].y !== cellPos.y)
          ? [{ x: cellPos.x-1, y: cellPos.y }, cellPos]
          : [cellPos]
      ).flatten()
      .thru( cellsPos => // remove duplicate last cell
        _.eq(_.last(cellsPos), cellsPos[cellsPos.length-2])
          ? _.initial(cellsPos)
          : cellsPos
      ).map( ({x, y}) => flip ? { x: y, y: x } : {x, y} )
      .value();
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

    let cellPosStart = this.getCellPosAndOffset(line.x1, line.y1);
    let cellPosEnd = this.getCellPosAndOffset(line.x2, line.y2);

    cellsPos.push(cellPosStart);
    if (line.dx === 0 && line.dy === 0 || cellPosStart.x === cellPosEnd.x && cellPosStart.y === cellPosEnd.y) {
      return cellsPos; // done
    }

    let box = getBox(cellPosStart.x, cellPosStart.y, cellPosEnd.x, cellPosEnd.y);

    let getNextPos;

    if (line.dx === 0) {
      getNextPos = (l, x, y, dx, dy) => { return { x: x, y: y + dy }; };

    } else if (line.dy === 0) {
      getNextPos = (l, x, y, dx, dy) => { return { x: x + dx, y: y }; };

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

    addNextCell(cellPosStart, { x: line.x1, y: line.y1 });

    return cellsPos;
  }

  getDelta(line, cellPos) {
    let dx, dy;
    if (cellPos.x < 0) {
      dx = (this.gridSize + cellPos.gx) * (line.dx > 0 ? 1 : -1);
    } else {
      dx = -cellPos.gx + (line.dx > 0 ? this.gridSize : -1);
    }
    if (cellPos.y < 0) {
      dy = (this.gridSize + cellPos.gy) * (line.dy > 0 ? 1 : -1);
    } else {
      dy = -cellPos.gy + (line.dy > 0 ? this.gridSize : -1);
    }
    return { x: dx, y: dy };
  }

  getNextPos(line, x, y, dx, dy) {
    let slope = line.dy / line.dx;
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
      x: x + line.dx * dy / line.dy,
      y: y + dy
    };
  }
}

class GridV61 extends GridV62 {

  getDelta(line, cellPos) {
    return {
      x: -cellPos.gx + (line.dx > 0 ? this.gridSize : -1),
      y: -cellPos.gy + (line.dy > 0 ? this.gridSize : -1)
    };
  }

  getNextPos(line, x, y, dx, dy) {
    let slope = line.dy / line.dx;
    let yIsThisBelowActualY0 = line.y1 - slope * line.x1;
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

module.exports = { Grid, GridV62, GridV61 };
