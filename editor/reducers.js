'use strict';

import {SimState} from 'core'

import Immutable from 'immutable';

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
  MOD_PLAYBACK_STATE,
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
  HIDE_TRACK_SAVER,
  SET_TRACK_NAME,
  PUSH_ACTION,
  UNDO,
  REDO,
  DRAW_STREAM_START,
  DRAW_STREAM_END,
  SELECT_LINE,
  ADD_BALL,
  REMOVE_BALL,
  REPLACE_BALL,
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
    toolbarsOpen: false,
    timeControlOpen: false,
    sidebarOpen: false,
    sidebarSelected: -1,
    colorSelected: 0
  },
  modKeys: {
    shift: false,
    mod: false,
    alt: false
  },
  selectedTool: null,
  toggled: Object.create(null),
  hotkeys: Object.create(null),
  playback: {
    state: 'stop',
    modState: null,
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
  simStatesData: {
    simStates: [SimState([],[])],
    nextID: 1
  },
  history: {
    undoStack: Immutable.Stack(),
    redoStack: Immutable.Stack()
  },
  drawStreamActive: false, // cancellable draw streams
  lineSelection: {
    lineID: null
  }
};

export function lineSelection(state = INIT.lineSelection, action) {
  switch (action.type) {
    case SELECT_LINE:
      return {
        lineID: action.lineID // TODO: multiple selection
      }
    default:
      return state
  }
}

export function drawStreamActive(state = INIT.drawStreamActive, action) {
  switch (action.type) {
    case DRAW_STREAM_START:
      return true
    case DRAW_STREAM_END:
      return false
    default:
      return state
  }
}

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
    // case LOAD_FILE_SUCCESS:
    //   return {...state,
    //     sidebarOpen: true,
    //     sidebarSelected: INIT.toolbars.sidebarSelected
    //   }
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
    case LOAD_TRACK:
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
    case MOD_PLAYBACK_STATE:
      return {...state,
        modState: action.mod
      };
    case SET_FLAG:
      if (action.index != null) {
        return {...state,
          flag: action.index
        }
      } else if (state.flag === state.index && state.state === 'stop') { // TODO: reset flag if pressed twice
        return {...state,
          flag: INIT.playback.flag,
          index: INIT.playback.index
        }
      }
      return {...state,
        flag: state.index
      }
    case NEW_TRACK:
    case LOAD_TRACK:
      return INIT.playback
    default:
      return state;
  }
}

// // TODO: change redux-devtools to have deserialized actions
// function turnIntoMapIfNecessary(lineStore) {
//   if (lineStore instanceof Immutable.Map) {
//     return lineStore
//   }
//   console.warn('action.lineStore was not a Map')
//   if (!__DEVTOOLS__) {  // eslint-disable-line no-undef
//     console.error('This should not happen in production') // throw an error?
//   }
//   return Immutable.Map(lineStore).mapKeys(key => parseInt(key, 10))
// }
// export function trackData(state = INIT.trackData, action) {
//   switch (action.type) {
//     case NEW_TRACK:
//     case LOAD_TRACK:
//       let { startPosition, version, label, lineStore } = action
//       return {
//         maxLineID: action.maxLineID || 0,
//         saved: false,
//         lineStore: turnIntoMapIfNecessary(lineStore),
//         startPosition,
//         version,
//         label
//       }
//     case SET_TRACK_NAME:
//       return {...state,
//         label: action.name
//       }
//     case ADD_LINE:
//     case REMOVE_LINE:
//     case REPLACE_LINE:
//       return {...state,
//         maxLineID: action.maxLineID,
//         lineStore: turnIntoMapIfNecessary(action.lineStore)
//       }
//     default:
//       return state;
//   }
// }
const getMaxID = (entities) => entities.reduce((maxID, e) => Math.max(maxID, e.id), 0)
export function simStatesData(state = INIT.simStatesData, action) {
  switch (action.type) {
    case INC_FRAME_INDEX:
    case DEC_FRAME_INDEX:
    case SET_FRAME_INDEX:
    case REPLACE_LINE:
    case REMOVE_LINE:
    case REMOVE_BALL:
    case REPLACE_BALL:
      return {
        nextID: state.nextID,
        simStates: action.simStates
      }
    case ADD_LINE:
      return {
        nextID: Math.max(state.nextID, (action.line instanceof Array ? getMaxID(action.line) : action.line.id) + 1),
        simStates: action.simStates
      }
    case ADD_BALL:
      return {
        nextID: Math.max(state.nextID, (action.ball instanceof Array ? getMaxID(action.ball) : action.ball.id) + 1),
        simStates: action.simStates
      }
    case NEW_TRACK:
      return INIT.simStatesData
    case LOAD_TRACK:
      return {
        nextID: Math.max(getMaxID(action.wires), getMaxID(action.balls)) + 1,
        simStates: [SimState(action.balls, action.wires)]
      }
    default:
      return state;
  }
}

function getAction({action: {type, line, id, prevLine, ball, prevBall}}) {
  return {type, line, prevLine, id, ball, prevBall}
}
export function history(state = INIT.history, action) {
  switch (action.type) {
    case PUSH_ACTION:
      return {
        undoStack: state.undoStack.push(getAction(action)),
        redoStack: INIT.history.redoStack
      }
    case UNDO:
      if (state.undoStack.size === 0) {
        return state
      }
      return {
        redoStack: state.redoStack.push(state.undoStack.peek()),
        undoStack: state.undoStack.pop()
      }
    case REDO:
      if (state.redoStack.size === 0) {
        return state
      }
      return {
        undoStack: state.undoStack.push(state.redoStack.peek()),
        redoStack: state.redoStack.pop()
      }
    default:
      return state
  }
}
