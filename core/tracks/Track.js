'use strict';

import _ from 'lodash';
import { Store, LineStore } from '../stores';
import { Rider, DebugRider } from '../riders';
import { makeLine } from '../lines';

export default class Track extends Store {

  makeStore() {
    return new LineStore();
  }

  constructor(lineData, startPosition = { x: 0, y: 0 }, debug = false) {
    super();

    this.debug = debug;

    this.setStartPosition(startPosition);

    this.store = this.makeStore();

    lineData.forEach( data => this.addLine(data) );
  }

  setStartPosition(pos) {
    this.startX = pos.x;
    this.startY = pos.y;
    this.rider = new (this.debug ? DebugRider : Rider)(pos.x, pos.y);
    this.initRiderState = this.rider.getState();
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
      return this.frameCache[frameNum];
    }

    this.rider.setState(_.last(this.frameCache));
    for (let i = this.frameCache.length; i <= frameNum; i++) {

      this.rider.step(this.store);

      this.frameCache[i] = this.rider.getState();
    }

    return this.frameCache[frameNum];
  }

  updateFrameCache(line, removed) { // eslint-disable-line no-unused-vars
    // don't be too clever right now
    // any solid line modification resets the cache
    if (line.isSolid) {
      this.resetFrameCache();
    }
  }

  resetFrameCache() {
    this.frameCache = [ this.initRiderState ];
  }

  get lineStore() {
    return this.store.lines;
  }

  getLines() {
    return this.store.getLines();
  }

  addLine(l) {
    let line = makeLine(l);
    this.store.addLine(line);
    this.updateFrameCache(line);
  }

  removeLine(line) {
    this.store.removeLine(line);
    this.updateFrameCache(line, true);
  }

  getLinesInRadius(x, y, r) {
    return this.store.getLinesInRadius(x, y, r);
  }

  getLinesInBox(x1, y1, x2, y2) {
    return this.store.getLinesInBox(x1, y1, x2, y2);
  }

}
