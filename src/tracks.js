'use strict';

var _ = require('lodash');

var {
  LineStore,
  GridStore,
  OldGridStore
} = require('./stores');

var {
  LineTypes: {
    SOLID_LINE, ACC_LINE, SCENERY_LINE
  },
  SolidLine,
  AccLine,
  SceneryLine
} = require('./lines');

var { Rider, DebugRider } = require('./riders');

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
    let LineType;

    switch (l.type) {
      case SOLID_LINE:
        LineType = SolidLine;
        break;
      case ACC_LINE:
        LineType = AccLine;
        break;
      case SCENERY_LINE:
        LineType = SceneryLine;
        break;
      default:
        throw new Error('Unknown line type: ' + l.type);
    }

    let line = new LineType(l.id, l.x1, l.y1, l.x2, l.y2, l.flipped, l.extended);
    if (l.type !== SCENERY_LINE) {
      line.leftLine = l.leftLine || null;
      line.rightLine = l.rightLine || null;
    }
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
    if (line.type !== SCENERY_LINE) {
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

class OldTrack extends Track {
  constructor(lineData, startPosition, debug) {
    super(lineData, startPosition, debug);
  }

  getNewStore() {
    return new OldGridStore();
  }
}

class NoGridTrack extends Track {
  constructor(lineData, startPosition, debug) {
    super(lineData, startPosition, debug);
  }

  getNewStore() {
    return new LineStore();
  }
}

module.exports = {
  Track: Track,
  OldTrack: OldTrack,
  NoGridTrack: NoGridTrack
};
