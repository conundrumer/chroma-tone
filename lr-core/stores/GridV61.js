'use strict';

import GridV62 from './GridV62';

export default class GridV61 extends GridV62 {

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
