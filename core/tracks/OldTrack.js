'use strict';

import Track from './Track';

export default class OldTrack extends Track {

  get isV61() {
    return true;
  }
}
