'use strict';

import GridStore from './GridStore';

function getBox(x1, y1, x2, y2) {
  let left = Math.min(x1, x2);
  let right = Math.max(x1, x2);
  let top = Math.min(y1, y2);
  let bottom = Math.max(y1, y2);

  return {
    left: left,
    right: right,
    top: top,
    bottom: bottom,
    corners: [
      [left, top], [left, bottom], [right, top], [right, bottom]
    ].map( c => { return {x: c[0], y: c[1]}; } )
  };
}

function inBounds(p, box) {
  return (
       p.x >= box.left
    && p.x <= box.right
    && p.y >= box.top
    && p.y <= box.bottom
  );
}

export default class GridV62 extends GridStore {

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
