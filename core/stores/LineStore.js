import Store from './Store';
import ArrayStore from './ArrayStore';
import MapStore from './MapStore';
import GridStore from './GridStore';
import SolidGridStore from './SolidGridStore';
import GridV62 from './GridV62';
import GridV61 from './GridV61';
import Cell from './Cell';
import OrderedCell from './OrderedCell';

export default class LineStore extends Store {

  static get GRID_SIZE() {
    return 14;
  }

  constructor(useV61 = false) {
    super();
    this.lines = new MapStore();
    this.linesAsJSON = new MapStore()
    this.lineArray = new ArrayStore()
    this.grid = new GridStore(LineStore.GRID_SIZE * 4, Cell);
    let solidGrid = new (useV61 ? GridV61 : GridV62)(LineStore.GRID_SIZE, OrderedCell);
    this.solidGrid = new SolidGridStore(solidGrid);
  }

  getLineByID(id) {
    return this.lines.getLineByID(id);
  }

  addLine(line) {
    this.lines.addLine(line);
    this.linesAsJSON.addLine(line.toJSON())
    this.lineArray.addLine(line)
    this.grid.addLine(line);
    return this.solidGrid.addLine(line);
  }

  removeLine(line) {
    this.lines.removeLine(line);
    this.linesAsJSON.removeLine(line.toJSON())
    this.lineArray.removeLine(line)
    this.grid.removeLine(line);
    return this.solidGrid.removeLine(line);
  }

  getLines() {
    return this.lineArray.getLines();
  }

  getLinesInRadius(x, y, r) {
    return this.grid.getLinesInRadius(x, y, r);
  }

  getLinesInBox(x1, y1, x2, y2) {
    let [w, h] = [x2 - x1, y2 - y1];
    // i'll do this for now until i implement kd trees
    if (((w / this.grid.gridSize) | 0) * ((h / this.grid.gridSize) | 0) > 200) {
      return this.lineArray.getLinesInBox(x1, y1, x2, y2);
    }
    return this.grid.getLinesInBox(x1, y1, x2, y2);
  }

  getSolidLinesAt(x, y, debug) {
    return this.solidGrid.getSolidLinesAt(x, y, debug);
  }

  getCellKeysAt(x, y) {
    return this.solidGrid.getCellKeysAt(x, y);
  }
}
