/* track.js
 * A wrapper over LineStore
 */

var _ = require('lodash');

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
function Track(lineData, startPosition, debug) {
  this.debug = debug || false;

  this.startPosition = startPosition || { x: 0, y: 0 };
  this.resetFrameCache();

  this.store = this.getNewStore();

  lineData.forEach( data => this.addLine(data) );
}
Track.prototype = {

  set startPosition(pos) {
    this.startX = pos.x;
    this.startY = pos.y;
    this.initRider = new Rider(pos.x, pos.y, null, null, this.debug);
  },

  get startPosition() {
    return {
      x: this.startX,
      y: this.startY
    };
  },

  get lines() {
    return this.store.lines;
  },

  addLine(l) {
    let line;

    switch (l.type) {
      case LINE.SOLID:
        line = new SolidLine(l.x1, l.y1, l.x2, l.y2, l.flipped, l.extended);
        break;
      case LINE.ACC:
        line = new AccLine(l.x1, l.y1, l.x2, l.y2, l.flipped, l.extended);
        break;
      case LINE.SCENERY:
        line = new SceneryLine(l.x1, l.y1, l.x2, l.y2);
        break;
      default:
        throw new Error('Unknown line type: ' + l.type);
    }
    if (l.type !== LINE.SCENERY) {
      line.leftLine = l.leftLine || null;
      line.rightLine = l.rightLine || null;
    }
    this.store.addLine(line);
    this.updateFrameCache(line);

  },

  removeLine(line) {
    this.store.removeLine(line);
    this.updateFrameCache(line, true);
  },

  getLines(x1, y1, x2, y2) {
    return this.store.getLines(x1, y1, x2, y2);
  },

  getRiderAtFrame(frameNum) {
    if (this.frameCache[frameNum]) {
      return this.frameCache[frameNum];
    }

    let rider;

    for (let i = this.frameCache.length; i <= frameNum; i++) {
      // make a copy
      rider = this.frameCache[i-1].clone();

      rider.step(this.collidePoint.bind(this));

      this.frameCache[i] = rider;
    }

    return rider;
  },

  updateFrameCache(line, removed) {
    // don't be too clever right now
    // any solid line modification resets the cache
    if (line.type !== LINE.SCENERY) {
      this.resetFrameCache();
    }
  },

  resetFrameCache() {
    this.frameCache = [ this.initRider ];
  },

  collidePoint(p, debugHandler) {
    this.store.selectCollidingLines(p.x, p.y, (line) => {
      line.collide(p);
      if (debugHandler) {
        // TODO: should I use line.id ?????
        debugHandler(line, line.id || _.indexOf(this.lines, line));
      }
    });
  },

  getNewStore() {
    return new GridStore();
  }

};

/* OldTrack
 * revision 6.1
 *
 * variables and methods same as Track
 */
function OldTrack(lineData, startPosition, debug) {
  Track.call(this, lineData, startPosition, debug);
}
OldTrack.prototype = _.create(Track.prototype, {
  constructor: OldTrack,

  getNewStore() {
    return new OldGridStore();
  }
});

/* NoGridTrack
 * uses LineStore instead of a grid
 *
 * variables and methods same as Track
 */
function NoGridTrack(lineData, startPosition, debug) {
  Track.call(this, lineData, startPosition, debug);
}
NoGridTrack.prototype = _.create(Track.prototype, {
  constructor: NoGridTrack,

  getNewStore() {
    return new LineStore();
  }
});

module.exports = {
  Track: Track,
  NoGridTrack: NoGridTrack
};
