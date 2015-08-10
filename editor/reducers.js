'use strict';

import {
  RESIZE,
  SHOW_TOOLBARS,
  HIDE_TOOLBARS,
  TOGGLE_TIME_CONTROL,
  TOGGLE_BUTTON,
  SET_TOOL
} from './actions';

// display dimensions
export function windowSize(state = {width: 1, height: 1}, action) {
  switch (action.type) {
    case RESIZE:
      return action.windowSize;
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
