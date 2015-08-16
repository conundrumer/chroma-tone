'use strict';

import Track from './Track';
import MapStore from '../stores/MapStore';

export default class NoGridTrack extends Track {

  constructor(lineData, startPosition, debug) {
    super(lineData, startPosition, debug);
    this.store = new MapStore();
  }

}
