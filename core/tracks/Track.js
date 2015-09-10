'use strict';

import _ from 'lodash';
import { Store, LineStore } from '../stores';
import { Rider, DebugRider } from '../riders';
import { makeLine } from '../lines';
import getBoundingBox from './getBoundingBox'
import getRiderCam from './getRiderCam'

export default class Track extends Store {

  makeStore() {
    return new LineStore();
  }

  constructor(lineData, startPosition = { x: 0, y: 0 }, debug = false) {
    super();

    this.debug = debug;

    this.store = this.makeStore();

    this.setStartPosition(startPosition);

    lineData.forEach( data => this.addLine(data) );
  }

  getData() {
    return this.getLines().map(line => line.getData())
  }

  setStartPosition(pos) {
    this.startX = pos.x;
    this.startY = pos.y;
    this.rider = new (this.debug ? DebugRider : Rider)(pos.x, pos.y);
    this.initRiderState = this.rider.getState();
    this.initRiderCells = this.rider.getCellKeys(this.store);
    this.resetFrameCache(); // moving the start point changes everything
  }

  getStartPosition() {
    return {
      x: this.startX,
      y: this.startY
    };
  }

  // TODO: refactor this to be less mutative, less oop more fn
  // TODO: figure out how to make this async for nonlaggy recalc
  // TODO: make corresponding graphic states for pending recalc
  getRiderStateAtFrame(frameNum) {
    if (frameNum < this.frameCache.length) {
      return this.frameCache[frameNum].rider;
    }

    this.rider.setState(_.last(this.frameCache).rider);
    for (let i = this.frameCache.length; i <= frameNum; i++) {

      let collidedLines = _.uniq(this.rider.step(this.store), line => line.id);

      let cellKeys = this.rider.getCellKeys(this.store);
      this.frameCache[i] = {
        rider: this.rider.getState(),
        cells: cellKeys,
        collidedLines: _.uniq(collidedLines, line => line.id)
      }
      cellKeys.forEach(key => {
        if (!(key in this.cellsCache) || this.cellsCache[key] > i) {
          this.cellsCache[key] = i
        }
      })

      collidedLines.forEach(({id}) => {
        if (!(id in this.collidedLines) || this.collidedLines[id] > i) {
          this.collidedLines[id] = i
        }
      })
    }

    return this.frameCache[frameNum].rider;
  }

  getBoundingBox() {
    return getBoundingBox(this.getLines());
  }

  getRiderCam(index, maxRadius) {
    return getRiderCam(this, index, maxRadius)
  }

  updateFrameCache(cellKeys, removedLine) { // eslint-disable-line no-unused-vars
    if (removedLine) {
      let collidedLinesToRemove = []
      if (removedLine.id in this.collidedLines) {
        let i = this.collidedLines[removedLine.id]
        while (this.frameCache.length > i) {
          // cache invalidate frameCache
          let { collidedLines } = this.frameCache.pop()
          collidedLines.forEach( ({id}) => {
            // cache invalidate collidedLines
            collidedLinesToRemove.push(this.collidedLines[id])
          })
        }
      }
      collidedLinesToRemove.forEach( line => {
        delete this.collidedLines[line]
      })
    } else {
      let cellKeysToRemove = []
      // TODO: check to see if line actually collides for improved performance
      cellKeys.forEach(key => {
        if (key in this.cellsCache) {
          let i = this.cellsCache[key]
          while (this.frameCache.length > i) {
            // cache invalidate frameCache
            let { cells } = this.frameCache.pop()
            cells.forEach( key => {
              // cache invalidate cellsCache
              cellKeysToRemove.push(this.cellsCache[key])
            })
          }
        }
      })
      cellKeysToRemove.forEach( key => {
        delete this.cellsCache[key]
      })
    }
    if (this.frameCache.length === 0) {
      this.resetFrameCache()
    }
  }

  resetFrameCache() {
    this.frameCache = [{
      rider: this.initRiderState,
      cells: this.initRiderCells,
      collidedLines: []
    }]
    this.cellsCache = Object.create(null)
    // {[cellKey] => most recent frame number}
    this.initRiderCells.forEach(key => { this.cellsCache[key] = 0 })
    this.collidedLines = Object.create(null)
  }

  get lineStore() {
    return this.store.linesAsJSON.lineMap;
  }

  set lineStore(newLineStore) {
    this.store.linesAsJSON.lineMap = newLineStore
  }

  get numLines() {
    return this.lineStore.size;
  }

  getLines() {
    return this.store.getLines();
  }

  getLineByID(id) {
    return this.store.getLineByID(id);
  }

  addLine(l) {
    let line = makeLine(l);
    if (this.getLineByID(line.id)) {
      console.warn('attempted to add existing line', l.id)
      // need to remove it and then add it
      return
    }
    let cellKeys = this.store.addLine(line);
    if (line.isSolid) {
      this.updateFrameCache(cellKeys)
    }
  }

  removeLine(l) {
    let id = l.id;
    let line = this.getLineByID(id);
    if (!line) {
      console.warn('attempted to remove non-existent line', id)
      return
    }
    let cellKeys = this.store.removeLine(line);
    if (line.isSolid) {
      this.updateFrameCache(cellKeys, line)
    }
  }

  getLinesInRadius(x, y, r) {
    return this.store.getLinesInRadius(x, y, r);
  }

  getLinesInBox(x1, y1, x2, y2) {
    return this.store.getLinesInBox(x1, y1, x2, y2);
  }

  updateLines(newLineStore) {
    let lineNotInStore = lineStore => line => {
      if (lineStore.has(line.id)) {
        let other = lineStore.get(line.id)
        return !(other === line || _.eq(other, line))
      }
      return true
    }
    let linesToRemove = this.lineStore.filter(lineNotInStore(newLineStore))
    let linesToAdd = newLineStore.filter(lineNotInStore(this.lineStore))
    // console.log('remove/add', linesToRemove.toJS(), linesToAdd.toJS())
    linesToRemove.forEach(line => this.removeLine(line))
    linesToAdd.forEach(line => this.addLine(line))
    this.lineStore = newLineStore
  }

}
