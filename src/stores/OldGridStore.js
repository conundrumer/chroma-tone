'use strict';

var GridStore = require('./GridStore');
var GridV61 = require('./GridV61');

class OldGridStore extends GridStore {
  constructor() {
    super();

    this.solidGrid = new GridV61(GridStore.GRID_SIZE, true);
  }

}

module.exports = OldGridStore;
