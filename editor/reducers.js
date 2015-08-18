'use strict';

import {
  RESIZE,
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
  NEW_TRACK,
  LOAD_TRACK,
  LOAD_FILE,
  LOAD_FILE_SUCCESS,
  LOAD_FILE_FAIL,
  IMPORT_TRACK,
  CANCEL_IMPORT,
} from './actions';

import { newTrack } from './actions';
// TODO: combine cam and windowSize to viewport
const INIT = {
  windowSize: {
    width: 1,
    height: 1
  },
  toolbars: {
    toolbarsVisible: false,
    timeControlVisible: false,
    sidebarOpen: false,
    sidebarSelected: -1,
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
    skipFrames: false,
    flag: 0
  },
  fileLoader: {
    open: true,
    loadingFile: false,
    error: null,
    fileName: null,
    tracks: null
  },
  trackData: trackData(null, newTrack())
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
    case NEW_TRACK:
      return INIT.editorCamera
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
      let { lineStore, startPosition, version, label } = action.track;
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
        lineStore: state.track.lineStore
      }
    case REMOVE_LINE:
      return {...state,
        lineStore: state.track.lineStore
      }
    default:
      return state;
  }
}
