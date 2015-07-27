/*eslint-env node, mocha */
'use strict';
var testTracks, solReader;
var SAVEDLINES = 'test/data/testLines.sol';
var fs = require('fs');

describe('SOL Reader', () => {

  before(() => {
    solReader = require.main.require('io').solReader;
  });
  it('loads a .sol file', (done) => {
    fs.readFile(SAVEDLINES, (err, data) => {
      if (err) {
        throw new Error('file not found:', err);
      }
      testTracks = solReader(data);
      void testTracks;
      done();
    });
  });
});
