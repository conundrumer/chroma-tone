'use strict';

var _ = require('lodash');

Math.expm1 = Math.expm1 || function(x) {
  return Math.exp(x) - 1;
};

// these factors are to make the camera converge after a certain period of time of low speed
// to prevent hte camera from jerking from stalling and looseness of bound() combined with the jitter of
// of past approximate camera positions
// the additional amount the camera converges to the center for speeds from near zero to a third the amount at 1
const ADDITIONAL_CONVERGENCE_FACTOR = 0.002;
// controls how long every frame will be taken into consideration immediately before the requested frame
// in getting the camera position. longer means more frames to converge for low speeds
const LINEAR_BUFFER_LENGTH = 4 * 40;

function bound(t, c) {
  let a = 1 / (1 + t / c);
  // return a * -Math.expm1(-Math.expm1(t)) + (1 - a) * (1 - 1 / (1 + t));
  // return -Math.expm1(-Math.expm1(t));
  // return -Math.expm1(-t);
  // return 1 - 1 / (1 + t);
  return (1 - a) * -Math.expm1(-Math.expm1(t)) + a * (1 - 1 / (1 + t * t));
}

function getPosAt(track, frameNum) {
  frameNum = Math.max(0, frameNum);
  return track.getRiderStateAtFrame(frameNum).position.clone();
}

function getRiderCam(track, frameNum, maxRadius, {
  C = ADDITIONAL_CONVERGENCE_FACTOR,
  N = LINEAR_BUFFER_LENGTH
} = {}) {

  // let quad = true; // use quadratic
  // let quad = false; // use exponential

  // var rLen, getIndex;
  // if (quad) { // quadratic
  //   rLen = (Math.sqrt(8 * (frameNum - N) + 1) - 1) / 2;
  //   getIndex = i => (frameNum - N) - (i+1) * i / 2;
  // } else { // exponential
  //   rLen = Math.log2(frameNum - N);
  //   getIndex = i => (frameNum - N) - (Math.pow(2, i) - 1);
  // }
  // let r = _.range(Math.floor(rLen), -1, -1);
  // let samples = _.map(r, getIndex);
  // samples = samples.concat(_.range(frameNum - N + 1, frameNum + 1));

  let samples = _.range(frameNum - N + 1, frameNum + 1);

  let getNextPos = (prevPos, f) => {
    f = f | 0;
    if (f <= 0) {
      return prevPos;
    }
    let pos = getPosAt(track, f);
    if (pos.equals(prevPos)) {
      return pos
    }
    // let pos = smooth(f).clone();
    let d = prevPos.subtract(pos);
    let dist = maxRadius * bound(d.length() / maxRadius, C);
    // let dist = maxRadius * (1 - Math.exp(a * Math.pow(d.length() / maxRadius, )));
    // let dist = Math.min(d.length(), maxRadius);
    let nextPos = pos.add(d.unit().mulS(dist));
    // console.log(f, -Math.expm1(-f))
    // prevPos.lerp(nextPos, -Math.expm1(-f/2)); // damn it side effects
    return nextPos;
  };

  let p = _.reduce(samples, getNextPos, getPosAt(track, 0));

  return p;
}

module.exports = getRiderCam;
