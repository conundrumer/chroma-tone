/* line-store.js
 *
 * the store to put track lines into
 * different stores subtly alter the physics
 * so there needs to be old versions to remain backwards compatible
 */

var _ = require('lodash');

var LINE = require('./line').LINE;

var GeoUtils = require('./geo-utils');
var
  getBox = GeoUtils.getBox,
  inBounds = GeoUtils.inBounds;

const GRIDSIZE = 14;

/* LineStore
 * - basic line store, no grid
 *
 * public:
 * - lines
 * - addLine(line)
 * - removeLine(line)
 * - getLines(x1, y1, x2 | r, [y2])
 * - selectCollidingLines(x, y, handler(line))
 */
class LineStore {
  constructor() {
    this.lines = [];
  }

  addLine(line) {
    this.lines.push(line);
  }

  removeLine(line) {
    this.lines = _.without(this.lines, line);
  }

  // returns an array of lines in this bounding box or radius
  getLines(x1, y1, x2, y2) {
    if (y2 === undefined) {
      let r = x2;
      return this.getLinesInRadius(x1, y1, r);
    }
    return this.getLinesInBox(x1, y1, x2, y2);
  }

  getLinesInRadius(x, y, r) {
    return this.lines.filter(line => line.inCircle(x, y, r));
  }

  getLinesInBox(x1, y1, x2, y2) {
    return this.lines.filter(line => line.inBox(x1, y1, x2, y2));
  }

  // does something with each line around (x, y)
  // like do collisions on points
  // the ordering of the lines affects the physics
  selectCollidingLines(x, y, handler) {
    this.lines.forEach((line) => {
      if (line.type !== LINE.SCENERY) {
        handler(line);
      }
    });
  }

}


function getCellPos (px, py) {
  let x = Math.floor(px / GRIDSIZE);
  let y = Math.floor(py / GRIDSIZE);
  return {
    x: x,
    y: y,
    gx: px - GRIDSIZE * x,
    gy: py - GRIDSIZE * y
  };
}

/* GridStore
 * - revision 6.2
 *
 * public:
 * - lines
 * - addLine(line) <- this adds property 'cells' to line
 * - removeLine(line)
 * - getLines(x1, y1, x2 | r, [y2])
 * - selectCollidingLines(x, y, handler(line))
 *
 * private:
 * - grid
 */
class GridStore extends LineStore {
  constructor() {
    super();
    this.grid = {};
  }

  static getCellPos(px, py) {
    let x = Math.floor(px / GRIDSIZE);
    let y = Math.floor(py / GRIDSIZE);
    return {
      x: x,
      y: y,
      gx: px - GRIDSIZE * x,
      gy: py - GRIDSIZE * y
    };
  }

  addLine(line) {
    super.addLine(line);

    let cellPosStart = GridStore.getCellPos(line.x1, line.y1);
    let cellPosEnd = GridStore.getCellPos(line.x2, line.y2);

    this.addLineToCell(line, cellPosStart);
    if (line.dx === 0 && line.dy === 0 || cellPosStart.x === cellPosEnd.x && cellPosStart.y === cellPosEnd.y) {
      // console.log('added xy line cell');
      return; // done
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
      let nextCellPos = GridStore.getCellPos(nextPos.x, nextPos.y);

      if (inBounds(nextCellPos, box)) {
        this.addLineToCell(line, nextCellPos);
        addNextCell(nextCellPos, nextPos);
      }
    };

    addNextCell(cellPosStart, { x: line.x1, y: line.y1 });
  }

  removeLine(line) {
    super.removeLine(line);

    line.cells.forEach( cellPos => {
      let cell = this.grid[cellPos.x][cellPos.y];
      cell.lines = _.without(cell.lines, line);

      if (line.type !== LINE.SCENERY) {
        cell.solidLines = _.without(cell.solidLines, line);
      }
    });
  }

  selectCollidingLines(x, y, handler) {
    let cellPos = GridStore.getCellPos(x, y);
    let range = [-1, 0, 1];

    range.forEach( i => {
      let cellX = i + cellPos.x;
      if (this.grid[cellX] === undefined) {
        return;
      }
      range.forEach( j => {
        let cellY = j + cellPos.y;
        let cell = this.grid[cellX][cellY];
        if (cell === undefined) {
          return;
        }
        cell.solidLines.forEach( line => handler(line, i, j) );
      });
    });
  }

  addLineToCell(line, cellPos) {
    if (line.cells === undefined) {
      line.cells = [];
    }

    line.cells.push({ x: cellPos.x, y: cellPos.y });

    if (this.grid[cellPos.x] === undefined) {
      this.grid[cellPos.x] = {};
    }
    if (this.grid[cellPos.x][cellPos.y] === undefined) {
      this.grid[cellPos.x][cellPos.y] = {
        lines: [],
        solidLines: []
      };
    }

    let cell = this.grid[cellPos.x][cellPos.y];

    if (_.includes(cell.lines, line)) {
      return; // no duplicates!!!
    }

    // TODO: separate these grids
    if (line.type !== LINE.SCENERY) {
      this.grid[cellPos.x][cellPos.y].solidLines.push(line);
    }
    this.grid[cellPos.x][cellPos.y].lines.push(line);
  }

  getDelta(line, cellPos) {
    let dx, dy;
    if (cellPos.x < 0) {
      dx = (GRIDSIZE + cellPos.gx) * (line.dx > 0 ? 1 : -1);
    } else {
      dx = -cellPos.gx + (line.dx > 0 ? GRIDSIZE : -1);
    }
    if (cellPos.y < 0) {
      dy = (GRIDSIZE + cellPos.gy) * (line.dy > 0 ? 1 : -1);
    } else {
      dy = -cellPos.gy + (line.dy > 0 ? GRIDSIZE : -1);
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

/* OldGridStore
 * - revision 6.1
 * - grid bugs as feature
 *
 * public:
 * - lines
 * - addLine(line)
 * - removeLine(line)
 * - getLines(x1, y1, x2 | r, [y2])
 * - selectCollidingLines(x, y, handler(line))
 *
 * private:
 * - grid
 */
class OldGridStore extends GridStore {
  constructor() {
    GridStore.call(this);
  }

  getDelta(line, cellPos) {
    return {
      x: -cellPos.gx + (line.dx > 0 ? GRIDSIZE : -1),
      y: -cellPos.gy + (line.dy > 0 ? GRIDSIZE : -1)
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

module.exports = {
  GRIDSIZE: GRIDSIZE,
  LineStore: LineStore,
  GridStore: GridStore,
  OldGridStore: OldGridStore
};
