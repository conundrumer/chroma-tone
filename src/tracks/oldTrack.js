'use strict';

var Track = require('./track');
var { OldGridStore } = require('../stores');

class OldTrack extends Track {

  getNewStore() {
    return new OldGridStore();
  }
}

module.exports = OldTrack;
