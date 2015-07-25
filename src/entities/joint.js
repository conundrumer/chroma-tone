'use strict';

var Constraint = require('./Constraint');

class Joint extends Constraint {

  constructor(id, s, t, p = null) {
    super(id);

    this.s = s;
    this.t = t;
    this.p = p;
  }

  copyState(s, t, p) {
    return {
      s: s || this.s.clone(),
      t: t || this.t.clone(),
      p: p || this.p ? this.p.clone() : null
    };
  }

}

module.exports = Joint;
