/* track.js
 * contains the rider and track lines
 * acts as line storage and physics sim
 */
'use strict';

var _ = require('lodash');

var {
  LineStore,
  GridStore,
  OldGridStore
} = require('./line-store');

var {
  LINE,
  SolidLine,
  AccLine,
  SceneryLine
} = require('./line');

var {Rider, DebugRider} = require('./rider');

/* Track
 * revision 6.2
 *
 * public:
 * - lines
 * - startPosition
 * - addLine(lineData) (see saved-lines-reader.js)
 * - removeLine(line)
 * - getLines(x1, y1, x2 | r, [y2])
 * - getRiderAtFrame(frameNum)
 *   * zero indexed
 *
 * private:
 * - store
 */
class Track {
  constructor(lineData, startPosition, debug = false) {
    this.debug = debug;

    this.startPosition = startPosition || { x: 0, y: 0 };
    this.resetFrameCache();

    this.store = this.getNewStore();

    lineData.forEach( data => this.addLine(data) );
  }

  set startPosition(pos) {
    this.startX = pos.x;
    this.startY = pos.y;
    this.rider = new (this.debug ? DebugRider : Rider)(pos.x, pos.y);
    this.initRiderState = this.rider.getState();
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

  addLine(l) {
    let LineType;

    switch (l.type) {
      case LINE.SOLID:
        LineType = SolidLine;
        break;
      case LINE.ACC:
        LineType = AccLine;
        break;
      case LINE.SCENERY:
        LineType = SceneryLine;
        break;
      default:
        throw new Error('Unknown line type: ' + l.type);
    }

    let line = new LineType(l.id, l.x1, l.y1, l.x2, l.y2, l.flipped, l.extended);
    if (l.type !== LINE.SCENERY) {
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

  updateFrameCache(line, removed) {
    // don't be too clever right now
    // any solid line modification resets the cache
    if (line.type !== LINE.SCENERY) {
      this.resetFrameCache();
    }
  }

  resetFrameCache() {
    this.frameCache = [ this.initRiderState ];
  }

  getNewStore() {
    return new GridStore();
  }

}

/* OldTrack
 * revision 6.1
 *
 * variables and methods same as Track
 */
class OldTrack extends Track {
  constructor(lineData, startPosition, debug) {
    super(lineData, startPosition, debug);
  }

  getNewStore() {
    return new OldGridStore();
  }
}

/* NoGridTrack
 * uses LineStore instead of a grid
 *
 * variables and methods same as Track
 */
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
