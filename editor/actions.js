'use strict';

/**
 * action types
 */

export const RESIZE = 'RESIZE';
export const SHOW_TOOLBARS = 'SHOW_TOOLBARS';
export const HIDE_TOOLBARS = 'HIDE_TOOLBARS';
export const TOGGLE_TIME_CONTROL = 'TOGGLE_TIME_CONTROL';
export const TOGGLE_HELP = 'TOGGLE_HELP';
export const SET_CURSOR = 'SET_CURSOR';


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
export function toggleHelp() {
  return {
    type: TOGGLE_HELP
  };
}
export function setCursor(hotkey) {
  return {
    type: SET_CURSOR,
    cursor: hotkey
  };
}
