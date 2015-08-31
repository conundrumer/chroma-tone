/*
sol saved lines schema:
[
  {
    label: string,
    version: string,
    startPosition: {x: float, y: float},
    lines: [
      {
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        extended: int (0-3),
        flipped: int (0-1),
        leftLine: int,
        rightLine: int,
        id: int,
        type: int (0-2)
      },
      ... older lines
    ]
  },
  ...older tracks
]
*/
'use strict';
var amf = require('amf');

var LINE_ATTRIBUTES = [
'x1',
'y1',
'x2',
'y2',
'extended',
'flipped',
'leftLine',
'rightLine',
'id',
'type'
];

var OFFSETS = {
  MAGIC: 0,
  FILE_SIZE: 2,
  TAG: 6,
  MARKER: 10,
  SOL_NAME_LENGTH: 16,
  SOL_NAME: 18
};

var SOL_NAME_OFFSETS = {
  PADDING: 0,
  DATA_NAME_LENGTH: 4,
  DATA_NAME: 6
};

var HEADER = {
  MAGIC: 0x00bf,
  MARKER_TAG: 'TCSO',
  MARKER: 0x000400000000,
  PADDING: 0x00000000,
  SOL_NAME: 'savedLines',
  DATA_NAME: 'trackList'
};

function getTracksDataOffset(data) {
  var fileSize, nameLength, paddingOffset, tracksDataOffset;

  [{
    name: 'Magic Number',
    value: HEADER.MAGIC,
    read: () => data.readUInt16BE(OFFSETS.MAGIC)
  }, {
    name: 'Marker Tag',
    value: HEADER.MARKER_TAG,
    read: () => {
      fileSize = data.readUInt32BE(OFFSETS.FILE_SIZE);
      return data.toString('utf8', OFFSETS.TAG, OFFSETS.MARKER);
    }
  }, {
    name: 'Marker',
    value: HEADER.MARKER,
    read: () => data.readUIntBE(OFFSETS.MARKER, OFFSETS.SOL_NAME_LENGTH - OFFSETS.MARKER)
  }, {
    name: 'Shared Object Name',
    value: HEADER.SOL_NAME,
    read: () => {
      nameLength = data.readUInt16BE(OFFSETS.SOL_NAME_LENGTH);
      paddingOffset = OFFSETS.SOL_NAME + nameLength + SOL_NAME_OFFSETS.PADDING;
      return data.toString('utf8', OFFSETS.SOL_NAME, paddingOffset);
    }
  }, {
    name: 'Padding',
    value: HEADER.PADDING,
    read: () => data.readUInt32BE(paddingOffset)
  }, {
    name: 'Data Name',
    value: HEADER.DATA_NAME,
    read: () => {
      let dataNameLengthOffset = OFFSETS.SOL_NAME + nameLength + SOL_NAME_OFFSETS.DATA_NAME_LENGTH;
      let dataNameOffset = OFFSETS.SOL_NAME + nameLength + SOL_NAME_OFFSETS.DATA_NAME;
      let dataNameLength = data.readUInt16BE(dataNameLengthOffset);
      tracksDataOffset = dataNameOffset + dataNameLength;
      return data.toString('utf8', dataNameOffset, dataNameOffset + dataNameLength);
    }
  }
  ].forEach( bytes => {
    let readBytes = bytes.read();
    if (bytes.value !== readBytes) {
      let expectedValue = bytes.value;
      let actualValue = readBytes;
      if (typeof expectedValue !== 'string') {
        expectedValue = expectedValue.toString(16);
        actualValue = actualValue.toString(16);
      }
      throw new Error(`Invalid header. Expected ${bytes.name} to be ${expectedValue}. Instead, got ${actualValue}.`);
    }
  });

  return tracksDataOffset;
}

function isValidTrack(track) {
  return track !== null && track !== undefined && track.data instanceof Array;
}

function solReader(data) {

  let tracksData = amf.read(data, getTracksDataOffset(data));
  if (!(tracksData instanceof Array)) {
    throw new Error('This .sol does not contain tracks: ' + tracksData);
  }
  return tracksData.map(track => {
    if (!isValidTrack(track)) {
      return null;
    }
    return {
      label: track.label,
      version: track.version,
      startPosition: {
        x: track.startLine[0],
        y: track.startLine[1]
      },
      lines: track.data.map(line => {
        let lineObj = {};
        LINE_ATTRIBUTES.forEach((attribute, i) => {
          lineObj[attribute] = line[i];
        });
        return lineObj;
      })
    };
  }).filter(track => track !== null);
}

module.exports = solReader;

// print to console

// var SAVEDLINES = 'testLines.sol';
// var fs = require('fs');

// fs.readFile(SAVEDLINES, (err, data) => {
//   if (err) {
//     return console.error(err);
//   }
//   var tracks = solReader(data);
//   tracks.forEach((track, i) => {
//     console.log('====== track', i, '======');
//     var lines = track.lines;
//     delete track.lines;
//     console.log(track);
//     // console.log('Line count:', lines.length);
//     console.log('--- Lines ---');
//     console.log(lines);
//   });
// });
