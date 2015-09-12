'use strict';

import Track from './Track';
import { LineStore } from '../stores';

export default class OldTrack extends Track {

  makeStore() {
    return new LineStore(true);
  }

}
