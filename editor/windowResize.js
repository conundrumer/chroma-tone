'use strict';

import browserSize from 'browser-size';
import { setWindowSize } from './actions';

export default function initWindowResizeHandler(dispatch) {
  var browser = browserSize();
  browser.on('resize', () => {
    dispatch(setWindowSize(browser));
  });
}
