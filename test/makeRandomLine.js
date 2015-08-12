'use strict';

var i = 0;

var Vector = require('../core/Vector');

var rand = (k) => k ? Math.random() * rand(k-1) : Math.random();

function makeRandomLine(range, k) {
  let v = new Vector(1, 0);
  let u = new Vector(1, 0);
  v.rotate(rand() * Math.PI * 2).mulS(rand() * range * k);
  u.rotate(rand() * Math.PI * 2).mulS(rand(2) * range);
  u.add(v);
  return {
    x1: v.x,
    y1: v.y,
    x2: u.x,
    y2: u.y,
    id: i++,
    type: Math.floor(3 * rand())
  };
}

module.exports = makeRandomLine;
