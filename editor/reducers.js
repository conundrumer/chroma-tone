'use strict';

import _ from 'lodash';

import {
  SHOW_TOOLBARS,
  HIDE_TOOLBARS,
  TOGGLE_TIME_CONTROL,
  TOGGLE_BUTTON,
  SET_TOOL,
  SET_HOTKEY,
  PAN,
  RESIZE
} from './actions';

// display dimensions
export function windowSize(state = {width: 1, height: 1}, action) {
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
const initToolbars = {
  toolbarsVisible: false,
  timeControlVisible: false,
  toggled: Object.create(null),
  tool: null
};
export function toolbars(state = initToolbars, action) {
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

export function hotkeys(state = Object.create(null), action) {
  switch (action.type) {
    case SET_HOTKEY:
      return {...state,
        [action.name]: action.hotkey
      };
    default:
      return state;
  }
}

export function editorCamera(state = { x: 0, y: 0, z: 1}, action) {
  switch (action.type) {
    case PAN:
      return {
        x: action.pos.x,
        y: action.pos.y,
        z: state.z
      };
    default:
      return state;
  }
}
