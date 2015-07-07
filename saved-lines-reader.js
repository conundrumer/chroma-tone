/*
saved lines schema:
[
  {
    label: string,
    version: string,
    startPosition: [x: float, y: float],
    lines: [
      {
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        extension: int (0-3),
        flipped: int (0-1),
        prevLine: int,
        nextLine: int,
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
'extension',
'flipped',
'prevLine',
'nextLine',
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
  MAGIC: 0X00bf,
  MARKER_TAG: 'TCSO',
  MARKER: 0x000400000000,
  PADDING: 0x00000000,
  SOL_NAME: 'savedLines',
  DATA_NAME: 'trackList'
};

function savedLinesReader(data) {

  let magic = data.readUInt16BE(OFFSETS.MAGIC);

  if (magic !== HEADER.MAGIC) {
    throw new Error('Header magic number does not match: ' + magic.toString(16));
  }

  let file_size = data.readUInt32BE(OFFSETS.FILE_SIZE);

  let markerTag = data.toString('utf8', OFFSETS.TAG, OFFSETS.MARKER);

  if (markerTag !== HEADER.MARKER_TAG) {
    throw new Error('Header marker tag does not match: ' + markerTag);
  }

  let markerLength = OFFSETS.SOL_NAME_LENGTH - OFFSETS.MARKER;
  let marker = data.readUIntBE(OFFSETS.MARKER, markerLength);

  if( marker !== HEADER.MARKER) {
    throw new Error('Header marker does not match: ' + marker.toString(16));
  }

  let nameLength = data.readUInt16BE(OFFSETS.SOL_NAME_LENGTH);
  let paddingOffset = OFFSETS.SOL_NAME + nameLength + SOL_NAME_OFFSETS.PADDING;
  let solName = data.toString('utf8', OFFSETS.SOL_NAME, paddingOffset);

  if (solName !== HEADER.SOL_NAME) {
    throw new Error('Header sol name does not match: ' + solName);
  }

  let padding = data.readUInt32BE(paddingOffset);

  if (padding !== HEADER.PADDING) {
    throw new Error('Header padding does not match: ' + padding.toString(16));
  }

  var dataNameLengthOffset = OFFSETS.SOL_NAME + nameLength + SOL_NAME_OFFSETS.DATA_NAME_LENGTH;
  var dataNameOffset = OFFSETS.SOL_NAME + nameLength + SOL_NAME_OFFSETS.DATA_NAME;
  let dataNameLength = data.readUInt16BE(dataNameLengthOffset);
  var tracksDataOffset = dataNameOffset + dataNameLength;
  let dataName = data.toString('utf8', dataNameOffset, dataNameOffset + dataNameLength);

  if (dataName !== HEADER.DATA_NAME) {
    throw new Error('Header data name does not match: ' + dataName);
  }


  let tracksData = amf.read(data, tracksDataOffset);
  return tracksData.map(track => {
    return {
      label: track.label,
      version: track.version,
      startPosition: track.startLine,
      lines: track.data.map(line => {
        let lineObj = {};
        LINE_ATTRIBUTES.forEach((attribute, i) => {
          lineObj[attribute] = line[i];
        });
        return lineObj;
      })
    };
  });
}

module.exports = savedLinesReader;

// print to console

// var SAVEDLINES = 'testLines.sol';
// var fs = require('fs');

// fs.readFile(SAVEDLINES, (err, data) => {
//   if (err) {
//     return console.error(err);
//   }
//   var tracks = savedLinesReader(data);
//   tracks.forEach((track, i) => {
//     console.log('====== track', i, '======');
//     var lines = track.lines;
//     delete track.lines;
//     console.log(track);
//     console.log('Line count:', lines.length);
//   });
// });
