'use strict';

import Track from './Track';
import MapStore from '../stores/MapStore';

export default class NoGridTrack extends Track {

  makeStore() {
    return new MapStore();
  }

  updateFrameCache() {
    this.resetFrameCache();
  }

}
