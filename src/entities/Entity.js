'use strict';

var _ = require('lodash');

class Entity {

  constructor(id) {
    this.id = id;
    this.init = this;
  }

  clone(...copyStateArgs) {
    return _.create(this.init, this.copyState(...copyStateArgs));
  }

  copyState() {
    throw new Error('not implemented');
  }

  setState() {
    throw new Error('not implemented');
  }

}

module.exports = Entity;
