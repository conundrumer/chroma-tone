'use strict';

import { RESIZE } from './actions';

export function windowSize(state = {width: 1, height: 1}, action) {
  switch (action.type) {
    case RESIZE:
      return action.windowSize;
    default:
      return state;
  }
}
