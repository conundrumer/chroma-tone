/*eslint-env node, mocha */

var defaultLines = [
  {
    x1: 15,
    y1: 180,
    x2: 190,
    y2: 190,
    extended: 0,
    flipped: false,
    leftLine: null,
    rightLine: null,
    id: 0,
    type: 0
  }
];

// var fps = 40;

var assert = require('assert');
var fs = require('fs');
var _ = require('lodash');
var SAVEDLINES = 'test/testLines.sol';
var CYCLOID = 'test/cycloid2.sol';
var testTracks, savedLinesReader;

describe('Saved Lines Reader', () => {
  it('compiles', () => {
    savedLinesReader = require('../saved-lines-reader');
  });
  it('loads a .sol file', (done) => {
    fs.readFile(SAVEDLINES, (err, data) => {
      if (err) {
        throw new Error('file not found:', err);
      }
      testTracks = savedLinesReader(data);
      done();
    });
  });
});

describe('Track', () => {
  let Track, OldTrack, defaultTrack;

  it('compiles', () => {
    Track = require('../track').Track;
    OldTrack = require('../track').OldTrack;
  });

  describe('Default single line', () => {
    it('able to be created', () => {
      defaultTrack = new Track(defaultLines, {x: 0, y: 0});
    });
    it('runs correctly (200 frames)', () => {
      let initRider = defaultTrack.getRiderAtFrame(0).clone();
      let rider = defaultTrack.getRiderAtFrame(200);
      assert(rider.crashed === false);
      assert(rider.points[0].pos.x > initRider.points[0].pos.x);
      assert(rider.points[0].pos.y > initRider.points[0].pos.y);
    });
  });

  describe('Default single line in 6.1', () => {
    it('able to be created', () => {
      defaultTrack = new OldTrack(defaultLines, {x: 0, y: 0});
    });
    it('runs correctly (200 frames)', () => {
      let initRider = defaultTrack.getRiderAtFrame(0).clone();
      let rider = defaultTrack.getRiderAtFrame(200);
      assert(rider.crashed === false);
      assert(rider.points[0].pos.x > initRider.points[0].pos.x);
      assert(rider.points[0].pos.y > initRider.points[0].pos.y);
    });
  });


  describe('Default single line with debug enabled', () => {
    it('able to be created', () => {
      defaultTrack = new Track(defaultLines, {x: 0, y: 0}, true);
    });
    it('runs correctly (200 frames)', () => {
      let rider = defaultTrack.getRiderAtFrame(200);
      assert(rider.crashed === false);
    });
  });

  describe('TestLines #8 (6.1)', () => {
    let track;
    it('able to be created', () => {
      let trackData = testTracks[1];
      let startPos = trackData.startPosition;
      track = new OldTrack(trackData.lines, { x: startPos[0], y: startPos[1] });
    });
    it('runs correctly (2000 frames)', () => {
      let rider = track.getRiderAtFrame(2000);
      assert(rider.crashed === false);
    });
  });

  describe('Cycloid', function () {
    let track, trackData;

    this.timeout(10000);

    it('able to be created', (done) => {
      fs.readFile(CYCLOID, (err, data) => {
        if (err) {
          throw new Error('file not found:', err);
        }
        let tracks = savedLinesReader(data);
        trackData = tracks[0];
        let startPos = trackData.startPosition;
        track = new Track(trackData.lines, { x: startPos[0], y: startPos[1] });
        assert(track.lines.length === 645);
        done();
      });
    });
    it('runs with the rider not crashing (1200 frames)', () => {
      let rider = track.getRiderAtFrame(1200);
      assert(rider.crashed === false);
    });
    it('runs with the sled breaking (1300 frames)', () => {
      let rider = track.getRiderAtFrame(1300);
      assert(rider.crashed === true);
      assert(rider.sledBroken === true);
    });
    it('runs the same with lines randomly added/removed (1200 frames)', () => {
      let startPos = trackData.startPosition;
      let shuffledTrack = new Track([], { x: startPos[0], y: startPos[1] });


      var addRemoveLines = (lines) => {
        let removedLines = [];
        _.forEach(lines, (line, i) => {
          shuffledTrack.addLine(lines.pop());
          if (i % 3 === 2) {
            let lineToRemove = _.sample(shuffledTrack.lines);
            shuffledTrack.removeLine(lineToRemove);
            removedLines.push(lineToRemove);
          }
        });
        if (removedLines.length > 0) {
          addRemoveLines(removedLines);
        }
      };

      addRemoveLines(track.lines);

      _.times(1200, (i) => {
        let rider = shuffledTrack.getRiderAtFrame(i);
        assert(rider.crashed === track.getRiderAtFrame(i).crashed);
      });

    });
  });
});
