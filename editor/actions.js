'use strict';

import * as tools from './tools';
import bindHotkey from './bindHotkey';
import DrawCancelledException from './DrawCancelledException';
import { setIndexAndRate, startPlayback } from './playback'

/**
 * action types
 */

export const RESIZE = 'RESIZE';
export const SHOW_TOOLBARS = 'SHOW_TOOLBARS';
export const HIDE_TOOLBARS = 'HIDE_TOOLBARS';
export const TOGGLE_TIME_CONTROL = 'TOGGLE_TIME_CONTROL';
export const TOGGLE_BUTTON = 'TOGGLE_BUTTON';
export const SET_TOOL = 'SET_TOOL';
export const SET_HOTKEY = 'SET_HOTKEY';
export const SET_CAM = 'SET_CAM';
export const SET_FRAME_INDEX = 'SET_FRAME_INDEX';
export const SET_FRAME_MAX_INDEX = 'SET_FRAME_MAX_INDEX';
export const SET_FRAME_RATE = 'SET_FRAME_RATE';
export const INC_FRAME_INDEX = 'INC_FRAME_INDEX';
export const DEC_FRAME_INDEX = 'DEC_FRAME_INDEX';
export const SET_PLAYBACK_STATE = 'SET_PLAYBACK_STATE';

/**
 * action creators
 */

// display dimensions
export function setWindowSize({ width, height }) {
  return {
    type: RESIZE,
    windowSize: { width, height }
  };
}

// toolbars
export function showToolbars() {
  return {
    type: SHOW_TOOLBARS
  };
}
export function hideToolbars() {
  return {
    type: HIDE_TOOLBARS
  };
}
export function toggleTimeControl() {
  return {
    type: TOGGLE_TIME_CONTROL
  };
}
export function toggleButton(name) {
  return {
    type: TOGGLE_BUTTON,
    name: name
  };
}
export function setTool(tool) {
  return {
    type: SET_TOOL,
    tool: tool
  };
}

export function setHotkey(combokeys, ripples, name, hotkey) {
  return (dispatch, getState) => {
    let oldHotkey = getState().hotkeys[name];
    if (oldHotkey) {
      combokeys.unbind(oldHotkey, 'keydown');
      combokeys.unbind(oldHotkey, 'keyup');
    }

    dispatch({
      type: SET_HOTKEY,
      name,
      hotkey
    });

    if (hotkey) {
      bindHotkey(combokeys, ripples, name, hotkey, dispatch);
    }
  }
}

export function setCam(cam) {
  return {
    type: SET_CAM,
    cam
  };
}

// playback
export function incFrameIndex() {
  return {
    type: INC_FRAME_INDEX
  };
}
export function decFrameIndex() {
  return {
    type: DEC_FRAME_INDEX
  };
}
export function setFrameIndex(index) {
  return {
    type: SET_FRAME_INDEX,
    index: index
  };
}
export function setFrameMaxIndex(maxIndex) {
  return {
    type: SET_FRAME_MAX_INDEX,
    maxIndex: maxIndex
  };
}

export function setFrameRate(rate) {
  return (dispatch, getState) => {
    let prevRate = getState().playback.rate;

    // dispatches are synchronous so rate is immediately set
    dispatch({
      type: SET_FRAME_RATE,
      rate: rate
    });

    if (prevRate === 0 && rate !== 0) {
      startPlayback(dispatch, getState);
    }
  };
}
export function setPlaybackState(state) {
  return (dispatch, getState) => {
    setIndexAndRate(state, dispatch, getState);
    dispatch({
      type: SET_PLAYBACK_STATE,
      state: state
    });
  };
}

export function draw(drawStream) {
  return (dispatch, getState) => {

    let { tool: currentTool } = getState().toolbars;

    let {
      stream,
      onNext,
      onCancel,
      onEnd
    } = tools[currentTool](drawStream, dispatch, getState);

    stream.subscribe(onNext, (err) => {
      if (err instanceof DrawCancelledException) {
        if (onCancel) {
          onCancel();
        }
      } else {
        throw err;
      }
    }, onEnd);
  };
}
