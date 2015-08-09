/*eslint-env node, mocha */

'use strict';

var assert = require('assert');
var _ = require('lodash');

var Track = require.main.require('core').Track;
var NoGridTrack = require.main.require('core/tracks').NoGridTrack;

var makeRandomLine = require('../makeRandomLine');

const NUM_LINES = 9001;

describe('Track with ' + NUM_LINES + ' lines', function() {

  var referenceTrack = new NoGridTrack([]);
  var track = new Track([]);
  var gridSize = track.store.grid.gridSize;

  before(() => {

    // const NUM_LINES = 35000; // similar to archeology
    const CELL_RANGE = 16;

    console.log('Generating random track...');
    _.times(NUM_LINES, () => {
      let line = makeRandomLine(gridSize * CELL_RANGE, CELL_RANGE / 2);
      referenceTrack.addLine(line);
      track.addLine(line);
    });

    // let lineLengths = _.map(track.lines, line => line.length).sort((a, b) => a - b);
    // console.log('average length', _.reduce(lineLengths, (total, length) => total + length, 0) / NUM_LINES);
    // console.log('3quarter', lineLengths[3 * NUM_LINES / 4 - 1]);
    // console.log('median', lineLengths[NUM_LINES / 2 - 1]);
    // console.log('quarter', lineLengths[NUM_LINES / 4 - 1]);
    // console.log('eighth', lineLengths[NUM_LINES / 8 - 1]);
    // let lineLengths = _.map(track.lines, line => line.length).sort((a, b) => a - b);
    // let cells = _.values(track.store.grid.cells);
    // let avgNumLinesPerCell = _.reduce(cells, (total, cell) => cell.getLines().length + total, 0) / cells.length;

  });

  function shouldNotBeDifferent(referenceLines, lines) {
    // console.log(referenceLines.length)
    // console.log(lines.length)
    referenceLines = _.map(referenceLines, line => line.id);
    lines = _.map(lines, line => line.id);
    let diff = _.xor(referenceLines, lines);
    // console.log(referenceLines.length, lines.length, diff.length)
    assert(diff.length === 0);
  }

  function testBoxWithSize(side) {
    let box = [-side, -side, side, side];
    let referenceLines = referenceTrack.getLinesInBox(...box);
    let lines = track.getLinesInBox(...box);
    // shouldNotBeDifferent(referenceLines, null);
    // shouldNotBeDifferent(null, lines);
    shouldNotBeDifferent(referenceLines, lines);
  }

  function testCircleWithSize(radius) {
    let circle = [0, 0, radius];
    let referenceLines = referenceTrack.getLinesInRadius(...circle);
    let lines = track.getLinesInRadius(...circle);
    // shouldNotBeDifferent(referenceLines, null);
    // shouldNotBeDifferent(null, lines);
    shouldNotBeDifferent(referenceLines, lines);
  }

  this.slow(1);
  describe('getLinesInBox', () => {
    it('selects lines in a tiny box correctly', () => {
      testBoxWithSize(gridSize / 16);
    });

    it('selects lines in a small box correctly', () => {
      testBoxWithSize(gridSize / 4);
    });

    it('selects lines in a medium box correctly', () => {
      testBoxWithSize(gridSize);
    });

    it('selects lines in a large box correctly', () => {
      testBoxWithSize(gridSize * 4);
    });

    it('selects lines in a huge box correctly', () => {
      testBoxWithSize(gridSize * 8);
    });
  });

  describe('getLinesInRadius', () => {
    it('selects lines in a tiny circle correctly', () => {
      testCircleWithSize(gridSize / 16);
    });

    it('selects lines in a small circle correctly', () => {
      testCircleWithSize(gridSize / 4);
    });

    it('selects lines in a medium circle correctly', () => {
      testCircleWithSize(gridSize);
    });

    it('selects lines in a large circle correctly', () => {
      testCircleWithSize(gridSize * 4);
    });

    it('selects lines in a huge circle correctly', () => {
      testCircleWithSize(gridSize * 8);
    });
  });

});
