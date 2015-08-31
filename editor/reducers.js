'use strict';

import {
  RESIZE,
  SET_MOD_KEY,
  SHOW_TOOLBARS,
  HIDE_TOOLBARS,
  SHOW_SIDEBAR,
  HIDE_SIDEBAR,
  SELECT_SIDEBAR_ITEM,
  SHOW_FILE_LOADER,
  HIDE_FILE_LOADER,
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
  SET_PLAYBACK_STATE,
  ADD_LINE,
  REMOVE_LINE,
  REPLACE_LINE,
  NEW_TRACK,
  LOAD_TRACK,
  LOAD_FILE,
  LOAD_FILE_SUCCESS,
  LOAD_FILE_FAIL,
  IMPORT_TRACK,
  CANCEL_IMPORT,
  SET_FLAG,
  SELECT_COLOR,
  SHOW_TRACK_SAVER,
  HIDE_TRACK_SAVER
} from './actions';

import { newTrack } from './actions';
// TODO: combine cam and windowSize to viewport
const INIT = {
  viewport: {
    w: 1,
    h: 1,
    x: 0,
    y: 0,
    z: 1
  },
  toolbars: {
    toolbarsOpen: true,
    timeControlOpen: true,
    sidebarOpen: false,
    sidebarSelected: -1,
    colorSelected: 0
  },
  modKeys: {
    shift: false
  },
  selectedTool: 'debugTool',
  toggled: Object.create(null),
  hotkeys: Object.create(null),
  playback: {
    state: 'stop',
    index: 0,
    maxIndex: 0,
    rate: 0,
    skipFrames: false,
    flag: 0
  },
  fileLoader: {
    open: false,
    loadingFile: false,
    error: null,
    fileName: null,
    tracks: null
  },
  trackSaver: {
    open: false
  },
  trackData: trackData(null, newTrack())
};

// display dimensions
export function viewport(state = INIT.viewport, action) {
  switch (action.type) {
    case RESIZE:
      return {...state,
        w: action.windowSize.width,
        h: action.windowSize.height
      };
    case SET_CAM:
      return {...state,
        x: action.cam.x,
        y: action.cam.y,
        z: action.cam.z
      }
    case NEW_TRACK:
      return {...state,
        x: INIT.viewport.x,
        y: INIT.viewport.y,
        z: INIT.viewport.z
      }
    default:
      return state;
  }
}

export function modKeys(state = INIT.modKeys, action) {
  switch (action.type) {
    case SET_MOD_KEY:
      return {...state,
        [action.key]: action.pressed
      }
    default:
      return state;
  }
}
// toolbars
export function toolbars(state = INIT.toolbars, action) {
  switch (action.type) {
    case SELECT_COLOR:
      return {...state,
        colorSelected: action.color
      }
    case SHOW_TOOLBARS:
      return {...state,
        toolbarsOpen: true
      };
    case HIDE_TOOLBARS:
      return {...state,
        toolbarsOpen: false
      };
    case LOAD_FILE_SUCCESS:
      return {...state,
        sidebarOpen: true,
        sidebarSelected: INIT.toolbars.sidebarSelected
      }
    case SHOW_SIDEBAR:
      return {...state,
        sidebarOpen: true
      };
    case IMPORT_TRACK:
    case CANCEL_IMPORT:
      /* TODO: distinguish sidebarOpen from other sidebar panels */
    case HIDE_SIDEBAR:
      return {...state,
        sidebarOpen: false
      };
    case SELECT_SIDEBAR_ITEM:
      return {...state,
        sidebarSelected: action.selected
      }
    case TOGGLE_TIME_CONTROL:
      return {...state,
        timeControlOpen: !state.timeControlOpen
      };
    default:
      return state;
  }
}

export function selectedTool(state = INIT.selectedTool, action) {
  switch (action.type) {
    case SET_TOOL:
      return action.tool
    default:
      return state;
  }
}

export function fileLoader(state = INIT.fileLoader, action) {
  switch (action.type) {
    case SHOW_FILE_LOADER:
      return {...state,
        open: true
      };
    case HIDE_FILE_LOADER:
      return {...state,
        open: false
      };
    case LOAD_FILE:
      return {...state,
        loadingFile: true
      }
    case LOAD_FILE_SUCCESS:
      return {...state,
        loadingFile: false,
        open: false,
        fileName: action.fileName,
        tracks: action.tracks
      }
    case LOAD_FILE_FAIL:
      return {...state,
        loadingFile: false,
        error: action.error
      }
    default:
      return state;
  }
}
export function trackSaver(state = INIT.trackSaver, action) {
  switch (action.type) {
    case SHOW_TRACK_SAVER:
      return {...state,
        open: true
      }
    case HIDE_TRACK_SAVER:
      return {...state,
        open: false
      }
    default:
      return state
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
        maxIndex: Math.max(state.maxIndex, index)
      };
    case SET_FRAME_MAX_INDEX:
      let maxIndex = Math.max(0, action.maxIndex);
      return {...state,
        index: Math.min(state.index, maxIndex),
        maxIndex: maxIndex,
      };
    case SET_FRAME_RATE:
      return {...state,
        rate: action.rate,
      };
    case SET_PLAYBACK_STATE:
      return {...state,
        state: action.state
      };
    case SET_FLAG:
      if (state.flag === state.index) { // TODO: reset flag if pressed twice
        return {...state,
          flag: INIT.playback.flag,
          index: INIT.playback.index
        }
      } else {
        return {...state,
          flag: state.index
        }
      }
    case NEW_TRACK:
    case LOAD_TRACK:
      return INIT.playback
    default:
      return state;
  }
}

export function trackData(state = INIT.trackData, action) {
  switch (action.type) {
    case NEW_TRACK:
    case LOAD_TRACK:
      let { track: {lineStore}, startPosition, version, label } = action
      return {
        saved: false,
        track: action.track,
        lineStore,
        startPosition,
        version,
        label
      }
    case ADD_LINE:
      return {...state,
        lineStore: action.lineStore
      }
    case REMOVE_LINE:
      return {...state,
        lineStore: action.lineStore
      }
    case REPLACE_LINE:
      return {...state,
        lineStore: action.lineStore
      }
    default:
      return state;
  }
}
