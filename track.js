/* track.js
 * contains the rider and track lines
 * acts as line storage and physics sim
 */

var _ = require('lodash');

// var Line = require('./line');
var Line = require('./line');
var
  LINE = Line.LINE,
  SolidLine = Line.SolidLine,
  AccLine = Line.AccLine,
  SceneryLine = Line.SceneryLine;

var Rider = require('./rider');

var Store = require('./line-store');
var
  LineStore = Store.LineStore,
  GridStore = Store.GridStore,
  OldGridStore = Store.OldGridStore;


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
  constructor(lineData, startPosition, debug) {
    this.debug = debug || false;

    this.startPosition = startPosition || { x: 0, y: 0 };
    this.resetFrameCache();

    this.store = this.getNewStore();

    lineData.forEach( data => this.addLine(data) );
  }

  set startPosition(pos) {
    this.startX = pos.x;
    this.startY = pos.y;
    this.initRider = new Rider(pos.x, pos.y, null, null, this.debug);
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
    if (this.frameCache[frameNum]) {
      return this.frameCache[frameNum];
    }

    let rider;

    for (let i = this.frameCache.length; i <= frameNum; i++) {
      // make a copy
      rider = this.frameCache[i-1].clone();

      rider.step(this.store);

      this.frameCache[i] = rider;
    }

    return rider;
  }

  updateFrameCache(line, removed) {
    // don't be too clever right now
    // any solid line modification resets the cache
    if (line.type !== LINE.SCENERY) {
      this.resetFrameCache();
    }
  }

  resetFrameCache() {
    this.frameCache = [ this.initRider ];
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
