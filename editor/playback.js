'use strict';

import { incFrameIndex, decFrameIndex, setFrameIndex, setFrameRate } from './actions';

const FPS = 60;

export function setIndexAndRate(state, dispatch, getState, unmoddingState) {
  let setRate = (r) => dispatch(setFrameRate(r));
  let setIndex = (i) => dispatch(setFrameIndex(i));
  let {state: prevState, flag} = getState().playback;

  switch (state) {
    case 'play':
    case 'slowmo':
      if (state === prevState && !unmoddingState) {
        setIndex(flag);
      }
      break;
    case 'stop':
      if (!unmoddingState) {
        setIndex(flag);
      }
      break;
  }

  switch (state) {
    case 'play':
      setRate(1);
      break;
    case 'slowmo':
      setRate(1 / 8);
      break;
    case 'pause':
    case 'stop':
      setRate(0);
      break;
    case 'forward':
      switch (prevState) {
        case 'play':
          setRate(4)
          break
        case 'slowmo':
          setRate(1 / 2)
          break
        case 'pause':
        case 'stop':
          setRate(1)
          break
      }
      break;
    case 'reverse':
      switch (prevState) {
        case 'play':
        case 'pause':
        case 'stop':
          setRate(-1)
          break
        case 'slowmo':
          setRate(-1 / 8);
          break
      }
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
