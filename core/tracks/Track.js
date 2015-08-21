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
  getRiderStateAtFrame(frameNum) {
    if (frameNum < this.frameCache.length) {
      return this.frameCache[frameNum].rider;
    }

    this.rider.setState(_.last(this.frameCache).rider);
    for (let i = this.frameCache.length; i <= frameNum; i++) {

      this.rider.step(this.store);

      let cellKeys = this.rider.getCellKeys(this.store);
      this.frameCache[i] = {
        rider: this.rider.getState(),
        cells: cellKeys
      }
      cellKeys.forEach(key => {
        if (!(key in this.cellsCache)) {
          // it must be the case that existing keys have lower indices
          this.cellsCache[key] = i
        }
      })

    }

    return this.frameCache[frameNum].rider;
  }

  getBoundingBox() {
    return getBoundingBox(this.getLines());
  }

  getRiderCam(index, maxRadius) {
    let {
      index: prevIndex,
      maxRadius: prevMaxRadius,
      cam: prevCam
    } = this.simpleCamCache;
    if (index === prevIndex && maxRadius === prevMaxRadius) {
      return prevCam;
    }
    let cam = getRiderCam(this, index, maxRadius)
    this.simpleCamCache = {index, maxRadius, cam}
    return cam;
  }

  updateFrameCache(cellKeys, removed) { // eslint-disable-line no-unused-vars
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
    if (this.frameCache.length === 0) {
      this.resetFrameCache()
    }
  }

  resetFrameCache() {
    this.frameCache = [{
      rider: this.initRiderState,
      cells: this.initRiderCells
    }]
    this.cellsCache = Object.create(null)
    // {[cellKey] => most recent frame number}
    this.initRiderCells.forEach(key => { this.cellsCache[key] = 0 })

    // TODO: cache this more intelligently i guess
    this.simpleCamCache = {
      index: 0,
      maxRadius: 0,
      cam: this.getStartPosition()
    }
  }

  get lineStore() {
    return this.store.lines.lineMap;
  }

  get numLines() {
    return this.lineStore.size;
  }

  getLines() {
    return this.store.getLines();
  }

  getLineByID(id) {
    return this.store.lines.getLineByID(id);
  }

  addLine(l) {
    let line = makeLine(l);
    let cellKeys = this.store.addLine(line);
    if (line.isSolid) {
      this.updateFrameCache(cellKeys)
    }
  }

  removeLine(line) {
    let id = line.id;
    line = this.getLineByID(id);
    let cellKeys = this.store.removeLine(line);
    if (line.isSolid) {
      this.updateFrameCache(cellKeys, true)
    }
  }

  getLinesInRadius(x, y, r) {
    return this.store.getLinesInRadius(x, y, r);
  }

  getLinesInBox(x1, y1, x2, y2) {
    return this.store.getLinesInBox(x1, y1, x2, y2);
  }

}
