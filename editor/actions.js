'use strict';

/**
 * action types
 */

export const RESIZE = 'RESIZE';


/**
 * action creators
 */

export function setWindowSize({ width, height }) {
  return {
    type: RESIZE,
    windowSize: { width, height }
  };
}
