'use strict';

import _ from 'lodash';

import {
  SHOW_TOOLBARS,
  HIDE_TOOLBARS,
  TOGGLE_TIME_CONTROL,
  TOGGLE_BUTTON,
  SET_TOOL,
  SET_HOTKEY,
  SET_CAM,
  RESIZE,
  SET_FRAME,
} from './actions';

const INIT = {
  windowSize: {
    width: 1,
    height: 1
  },
  toolbars: {
    toolbarsVisible: false,
    timeControlVisible: false,
    toggled: Object.create(null),
    tool: 'debugTool'
  },
  hotkeys: Object.create(null),
  editorCamera: {
    x: 0,
    y: 0,
    z: 1
  },
  frame: {
    index: 0,
    maxIndex: 0
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
    case TOGGLE_BUTTON:
      return {...state,
        toggled: {...state.toggled,
          [action.name]: !state.toggled[action.name]
        }
      };
    case SET_TOOL:
      return {...state,
        tool: action.tool
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

export function frame(state = INIT.frame, action) {
  switch (action.type) {
    case SET_FRAME: {
      return {
        index: action.index,
        maxIndex: Math.max(state.index, action.index)
      };
    }
    default:
      return state;
  }
}
