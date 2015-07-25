'use strict';

// http://stackoverflow.com/a/13871379
function getCellHash(a, b) {
  var A = (a >= 0 ? 2 * a : -2 * a - 1);
  var B = (b >= 0 ? 2 * b : -2 * b - 1);
  var C = ((A >= B ? A * A + A + B : A + B * B) / 2);
  return a < 0 && b < 0 || a >= 0 && b >= 0 ? C : -C - 1;
}

module.exports = getCellHash;
