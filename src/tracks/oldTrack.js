'use strict';

var Track = require('./Track');
var { OldGridStore } = require('../stores');

class OldTrack extends Track {

  getNewStore() {
    return new OldGridStore();
  }
}

module.exports = OldTrack;
