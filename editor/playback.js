'use strict';

import { incFrameIndex, decFrameIndex, setFrameIndex, setFrameRate } from './actions';

const FPS = 40;

export function setIndexAndRate(state, dispatch, getState) {
  let setRate = (r) => dispatch(setFrameRate(r));
  let setIndex = (i) => dispatch(setFrameIndex(i));
  let {state: prevState, flag} = getState().playback;

  switch (state) {
    case 'play':
    case 'slowmo':
      if (state === prevState) {
        setIndex(flag);
      }
      break;
    case 'stop':
      setIndex(flag);
      break;
  }

  switch (state) {
    case 'play':
      setRate(1);
      break;
    case 'slowmo':
      setRate(1/8);
      break;
    case 'pause':
    case 'stop':
      setRate(0);
      break;
  }
}

// If i make this a middleware, I can synchronize setIndex and setRate
export function startPlayback(dispatch, getState) {
  let prevTime = Date.now();
  let raf;
  (function step() {
    let {rate, skipFrames, index} = getState().playback;
    if (rate === 0) {
      cancelAnimationFrame(raf);
      return;
    } else {
      raf = requestAnimationFrame(step);
    }
    let dt = Date.now() - prevTime;
    let fps = Math.abs(rate) * FPS;
    let framesElapsed = Math.floor(dt / 1000 * fps);
    if (framesElapsed > 0) {
      prevTime += framesElapsed / fps * 1000;
      let di = skipFrames ? framesElapsed : 1;
      if (di === 1) {
        if (rate > 0) {
          dispatch(incFrameIndex());
        } else {
          dispatch(decFrameIndex());
        }
      } else {
        if (rate > 0) {
          dispatch(setFrameIndex(index + di));
        } else {
          dispatch(setFrameIndex(index - di));
        }
      }
    }
  })(); // immediately invoke step()
}
