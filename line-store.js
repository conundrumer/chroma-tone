/* line-store.js
 *
 * the store to put track lines into
 * different stores subtly alter the physics
 * so there needs to be old versions to remain backwards compatible
 */

var _ = require('lodash');

var LINE = require('./line').LINE;

var { Grid, GridV62, GridV61 } = require('./grid');

const GRID_SIZE = 14;

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
    // return this.lines
  }

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

    // for solid lines
    this.solidGrid = new GridV62(GRID_SIZE, true);

    // for all lines
    // darn there was a clever data structure for this stuff what was it
    // i think it was 2d sorted arrays?
    // i'll do it later
    this.grid = new Grid(GRID_SIZE * 4, false);
  }

  addLine(line) {
    super.addLine(line);

    this.grid.addLine(line);

    if (line.isSolid) {
      this.solidGrid.addLine(line);
    }
  }

  removeLine(line) {
    super.removeLine(line);

    this.grid.removeLine(line);

    if (line.isSolid) {
      this.solidGrid.removeLine(line);
    }
  }

  getSolidLinesAt(x, y) {
    let cellPos = this.solidGrid.getCellPos(x, y);
    let range = [-1, 0, 1];

    let lines = _.flattenDeep(range.map( i => range.map( j =>
        this.solidGrid.getLinesFromCell({ x: i + cellPos.x, y: j + cellPos.y })
    )));

    return lines;
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
    super();

    this.solidGrid = new GridV61(GRID_SIZE, true);
  }

}

module.exports = {
  GRID_SIZE: GRID_SIZE,
  LineStore: LineStore,
  GridStore: GridStore,
  OldGridStore: OldGridStore
};
