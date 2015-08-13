'use strict';

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

import { getButtons } from './buttons';
const modifierRegex = /mod|alt/;
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

    if (!hotkey) {
      return
    }

    let startRipple = () => {};
    let endRipple = () => {};
    if (name in ripples) {
      startRipple = () => ripples[name].forEach( ({start}) => start() );
      endRipple = () => ripples[name].forEach( ({end}) => end() );
    }

    let hotkeyActions = getButtons(dispatch);
    let boundAction = () => {};
    if (name in hotkeyActions && hotkeyActions[name].boundAction) {
      boundAction = hotkeyActions[name].boundAction;
    }

    if (modifierRegex.test(hotkey)) {
      combokeys.bind(hotkey, (e) => {
        e.preventDefault();
        boundAction();
        startRipple();
        requestAnimationFrame(() =>
          requestAnimationFrame(endRipple)
        );
      }, 'keydown');
    } else {
      var rippled = false;
      combokeys.bind(hotkey, (e) => {
        if (!rippled) {
          startRipple();
          rippled = true;
        }
      }, 'keydown');
      combokeys.bind(hotkey, (e) => {
        boundAction();
        endRipple();
        rippled = false;
      }, 'keyup');
    }

  }
}

// drawing
export function setCam(cam) {
  return {
    type: SET_CAM,
    cam
  };
}

function debugTool(stream, dispatch, getState) {
  stream.first().subscribe(pos => {
    console.log('start', pos.x, pos.y);
  });
  return {
    stream: stream.skip(1),
    onNext: () => console.log('move'),
    onCancel: () => console.log('cancel'),
    onEnd: () => console.log('end')
  };
}

function pan(stream, dispatch, getState) {
  var firstPos;
  stream.first().subscribe( pos => {
    firstPos = pos;
  });
  var { x, y, z } = getState().editorCamera;
  return {
    stream: stream.map((pos) =>
      firstPos.clone().subtract(pos).mulS(z).add({x, y})
    ),
    onNext: (trackPos) => dispatch(setCam({x: trackPos.x, y: trackPos.y, z})),
    onCancel: () => dispatch(setCam({x, y, z}))
  };

}

const ZOOM = {
  STRENGTH: Math.pow(2, 1/(2<<5)),
  MAX: 2<<4,
  MIN: 1/(2<<4)
};
function zoom(stream, dispatch, getState) {
  var firstPos, y0;
  var { editorCamera: {x, y, z}, windowSize: {width: w, height: h} } = getState();
  stream.first().subscribe( pos => {
    y0 = pos.y;
    // to absolute coordinates
    firstPos = pos.clone().subtract({x: w/2, y: h/2}).mulS(z).add({x, y});
  });
  return {
    stream: stream.map((pos) => {
      let dz = Math.pow(ZOOM.STRENGTH, y0 - pos.y);
      return Math.min(Math.max(z / dz, ZOOM.MIN), ZOOM.MAX);
    }),
    onNext: (zoom) => {
      // startPos + (initPan - startPos) * initZoom / zoom
      let pos = firstPos.clone().mulS(-1).add({x, y}).mulS(zoom / z).add(firstPos);
      dispatch(setCam({x: pos.x, y: pos.y, z: zoom}));
    },
    onCancel: () => dispatch(setCam({x, y, z}))
  };

}

var tools = { 'null': debugTool, pan, zoom };

import DrawCancelledException from './DrawCancelledException';
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
