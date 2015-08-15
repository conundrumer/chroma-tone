'use strict';

import _ from 'lodash';

import {
  RESIZE,
  SHOW_TOOLBARS,
  HIDE_TOOLBARS,
  TOGGLE_TIME_CONTROL,
  TOGGLE_BUTTON,
  SET_TOOL,
  SET_HOTKEY,
  SET_CAM,
  SET_FRAME_INDEX,
  SET_FRAME_MAX_INDEX,
  SET_FRAME_RATE,
  INC_FRAME_INDEX,
  DEC_FRAME_INDEX,
} from './actions';

const INIT = {
  windowSize: {
    width: 1,
    height: 1
  },
  toolbars: {
    toolbarsVisible: false,
    timeControlVisible: false,
    tool: 'debugTool',
  },
  toggled: Object.create(null),
  hotkeys: Object.create(null),
  editorCamera: {
    x: 0,
    y: 0,
    z: 1
  },
  playback: {
    state: 'stop',
    index: 0,
    maxIndex: 0,
    rate: 0,
    skipFrames: false
  },
};

// display dimensions
export function windowSize(state = INIT.windowSize, action) {
  switch (action.type) {
    case RESIZE:
      return {
        width: action.windowSize.width,
        height: action.windowSize.height
      };
    default:
      return state;
  }
}

// toolbars
export function toolbars(state = INIT.toolbars, action) {
  switch (action.type) {
    case SHOW_TOOLBARS:
      return {...state,
        toolbarsVisible: true
      };
    case HIDE_TOOLBARS:
      return {...state,
        toolbarsVisible: false
      };
    case TOGGLE_TIME_CONTROL:
      return {...state,
        timeControlVisible: !state.timeControlVisible
      };
    case SET_TOOL:
      return {...state,
        tool: action.tool
      };
    default:
      return state;
  }
}

export function toggled(state = INIT.toggled, action) {
  switch (action.type) {
    case TOGGLE_BUTTON:
      let isToggled;
      if (typeof action.isToggled === 'boolean') {
        isToggled = action.isToggled;
      } else {
        isToggled = !state[action.name];
      }
      return {...state,
        [action.name]: isToggled
      };
    default:
      return state;
  }
}

export function hotkeys(state = INIT.hotkeys, action) {
  switch (action.type) {
    case SET_HOTKEY:
      return {...state,
        [action.name]: action.hotkey
      };
    default:
      return state;
  }
}

export function editorCamera(state = INIT.editorCamera, action) {
  switch (action.type) {
    case SET_CAM:
      return action.cam;
    default:
      return state;
  }
}

export function playback(state = INIT.playback, action) {
  switch (action.type) {
    case INC_FRAME_INDEX:
      action.index = state.index + 1;
      break;
    case DEC_FRAME_INDEX:
      action.index = state.index - 1;
      break;
  }
  switch (action.type) {
    case INC_FRAME_INDEX:
    case DEC_FRAME_INDEX:
    case SET_FRAME_INDEX:
      let index = Math.max(0, action.index);
      return {...state,
        index: index,
        maxIndex: Math.max(state.index, index)
      };
    case SET_FRAME_MAX_INDEX:
      let maxIndex = Math.max(0, action.maxIndex);
      return {...state,
        index: Math.min(state.index, maxIndex),
        maxIndex: maxIndex,
      };
    case SET_FRAME_RATE:
      return {...state,
        rate: action.index,
      };
    default:
      return state;
  }
}
