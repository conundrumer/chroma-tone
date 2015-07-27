/*eslint-env node, mocha */
'use strict';
var testTracks, savedLinesReader;
var SAVEDLINES = 'test/data/testLines.sol';
var fs = require('fs');

describe('Saved Lines Reader', () => {

  before(() => {
    savedLinesReader = require.main.require('io').savedLinesReader;
  });
  it('loads a .sol file', (done) => {
    fs.readFile(SAVEDLINES, (err, data) => {
      if (err) {
        throw new Error('file not found:', err);
      }
      testTracks = savedLinesReader(data);
      void testTracks;
      done();
    });
  });
});
