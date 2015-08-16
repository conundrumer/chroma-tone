// todo: organize LineStore datastructure to make computing bounding box more efficient
'use strict';

var _ = require('lodash');

function sortLineXY({ x1, y1, x2, y2 }) {
  if (x1 > x2) {
    [x1, x2] = [x2, x1];
  }
  if (y1 > y2) {
    [y1, y2] = [y2, y1];
  }
  return [x1, y1, x2, y2];
}

function getBoundingBox(lines) {
  if (lines.length === 0) {
    return [0, 0, 0, 0];
  }
  if (lines.length === 1) {
    return sortLineXY(lines[0]);
  }
  return _(lines).map(sortLineXY).unzip().map( (a, i) =>
    (i < 2) ? _.min(a) : _.max(a)
  ).value();
}

module.exports = getBoundingBox;
