'use strict';

var _ = require('lodash');

var { GridStore } = require('../stores');
var { Rider, DebugRider } = require('../riders');
var { makeLine } = require('../lines');

class Track {
  constructor(lineData, startPosition, debug = false) {
    this.debug = debug;

    this.startPosition = startPosition || { x: 0, y: 0 };

    this.store = this.getNewStore();

    lineData.forEach( data => this.addLine(data) );
  }

  set startPosition(pos) {
    this.startX = pos.x;
    this.startY = pos.y;
    this.rider = new (this.debug ? DebugRider : Rider)(pos.x, pos.y);
    this.initRiderState = this.rider.getState();
    this.resetFrameCache(); // moving the start point changes everything
  }

  get startPosition() {
    return {
      x: this.startX,
      y: this.startY
    };
  }

  get lines() {
    return this.store.lines;
  }

  // TODO: make line factory I guess
  addLine(l) {
    let line = makeLine(l);
    this.store.addLine(line);
    this.updateFrameCache(line);
  }

  removeLine(line) {
    this.store.removeLine(line);
    this.updateFrameCache(line, true);
  }

  getLines(x1, y1, x2, y2) {
    return this.store.getLines(x1, y1, x2, y2);
  }

  getRiderAtFrame(frameNum) {
    if (frameNum < this.frameCache.length) {
      let riderState = this.frameCache[frameNum];
      this.rider.setState(riderState);
      return this.rider;
    }

    this.rider.setState(_.last(this.frameCache));
    for (let i = this.frameCache.length; i <= frameNum; i++) {

      this.rider.step(this.store);

      this.frameCache[i] = this.rider.getState();
    }

    return this.rider;
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

  getNewStore() {
    return new GridStore();
  }

  getLinesInRadius(x, y, r) {
    return this.store.getLinesInRadius(x, y, r);
  }

  getLinesInBox(x1, y1, x2, y2) {
    return this.store.getLinesInBox(x1, y1, x2, y2);
  }

}

module.exports = Track;
