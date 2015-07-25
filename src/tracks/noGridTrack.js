'use strict';

var Track = require('./track');
var { LineStore } = require('../stores');

class NoGridTrack extends Track {

  getNewStore() {
    return new LineStore();
  }
}

module.exports = NoGridTrack;
