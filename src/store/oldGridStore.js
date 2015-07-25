'use strict';

var GridStore = require('./gridStore');
var GridV61 = require('./gridV61');

class OldGridStore extends GridStore {
  constructor() {
    super();

    this.solidGrid = new GridV61(GridStore.GRID_SIZE, true);
  }

}

module.exports = OldGridStore;
