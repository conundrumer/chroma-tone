'use strict';

import * as tools from './tools';
import bindHotkey from './bindHotkey';
import DrawCancelledException from './DrawCancelledException';
import { setIndexAndRate, startPlayback } from './playback'
import { Track, OldTrack } from 'core'
import { solReader } from 'io'
import 'buffer'

const DEBUG = false;
/**
 * action types
 */

export const RESIZE = 'RESIZE';
export const SHOW_TOOLBARS = 'SHOW_TOOLBARS';
export const HIDE_TOOLBARS = 'HIDE_TOOLBARS';
export const SHOW_SIDEBAR = 'SHOW_SIDEBAR';
export const HIDE_SIDEBAR = 'HIDE_SIDEBAR';
export const SELECT_SIDEBAR_ITEM = 'SELECT_SIDEBAR_ITEM';
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
export const ADD_LINE = 'ADD_LINE';
export const REMOVE_LINE = 'REMOVE_LINE';
export const NEW_TRACK = 'NEW_TRACK';
export const LOAD_TRACK = 'LOAD_TRACK';
export const SHOW_FILE_LOADER = 'SHOW_FILE_LOADER';
export const HIDE_FILE_LOADER = 'HIDE_FILE_LOADER';
export const LOAD_FILE = 'LOAD_FILE';
export const LOAD_FILE_SUCCESS = 'LOAD_FILE_SUCCESS';
export const LOAD_FILE_FAIL = 'LOAD_FILE_FAIL';

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
export function showSidebar() {
  return {
    type: SHOW_SIDEBAR
  };
}
export function hideSidebar() {
  return {
    type: HIDE_SIDEBAR
  };
}
export function showFileLoader() {
  return {
    type: SHOW_FILE_LOADER
  }
}
export function hideFileLoader() {
  return {
    type: HIDE_FILE_LOADER
  }
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

/* thunk for side effects: mutating combokeys */
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

/* thunk for async actions */
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
/* thunk for logic in dispatching more actions (should move to reducer) */
export function setPlaybackState(state) {
  return (dispatch, getState) => {
    setIndexAndRate(state, dispatch, getState);
    dispatch({
      type: SET_PLAYBACK_STATE,
      state: state
    });
  };
}

/* thunk for async actions + getting state*/
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

/* thunk for side effects: mutating state.trackData.track */
export function addLine(line) {
  return (dispatch, getState) => {
    let { track } = getState().trackData
    if (line instanceof Array) {
      line.forEach(l => track.addLine(l));
    } else {
      track.addLine(line)
    }
    dispatch({
      type: ADD_LINE,
      line: line,
      lineStore: track.lineStore
    })
  }
}

/* thunk for side effects: mutating state.trackData.track */
export function removeLine(line) {
  return (dispatch, getState) => {
    let { track } = getState().trackData
    if (line instanceof Array) {
      line.forEach(l => track.removeLine(l));
    } else {
      track.removeLine(line)
    }
    dispatch({
      type: ADD_LINE,
      line: line,
      lineStore: track.lineStore
    })

  }
}

export function newTrack(isV61 = false) {
  let track = new (isV61 ? OldTrack : Track)([]);
  return {
    type: NEW_TRACK,
    track: track,
    lineStore: track.lineStore,
    startPosition: track.startPosition,
    label: (new Date()).toString(),
    version: isV61 ? '6.1' : '6.2'
  };
}

export function loadTrack(trackData) {
  let startPos = { x: trackData.startPosition[0], y: trackData.startPosition[1] };
  let track = new ((trackData.version === '6.1') ? OldTrack : Track)(trackData.lines, startPos);
  return {
    type: LOAD_TRACK,
    track: track,
    lineStore: track.lineStore,
    startPosition: track.getStartPosition(),
    label: trackData.label,
    version: trackData.version
  }
}

/* thunk for async actions */
export function loadFile([file]) {
  return (dispatch) => {
    dispatch({
      type: LOAD_FILE
    })
    let reader = new FileReader();

    reader.onload = (upload) => {
      try {
        let tracks = solReader(new Buffer(new Uint8Array(upload.target.result)));
        dispatch({
          type: LOAD_FILE_SUCCESS,
          fileName: file.name,
          tracks: tracks
        })
      } catch (e) {
        dispatch({
          type: LOAD_FILE_FAIL,
          error: e.message
        })
      }
    }
    reader.readAsArrayBuffer(file);
  }
}

export function selectSidebarItem(selected) {
  return {
    type: SELECT_SIDEBAR_ITEM,
    selected: selected
  }
}
