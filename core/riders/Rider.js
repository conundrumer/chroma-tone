'use strict';

var _ = require('lodash');

var Entity = require('../entities/Entity');
var Vector = require('../Vector');

var { makeRider } = require('./RiderMaker');
var { copyRider } = require('./RiderCopier');

var { getBodyParts, Joints: { STRING_PEG_TAIL } } = require('./RiderBody');

const
  // physics
  ITERATE = 6,
  GRAVITY = { x: 0, y: 0.175 },
  VX_INIT = 0.4,
  VY_INIT = 0,
  SCARF_FLUTTER_INTENSITY = 2,
  SPEED_THRESHOLD_FLUTTER = 40; // as this gets smaller, the scarf intensifies faster while speed increases


class Rider extends Entity {

  constructor(x, y, vx = VX_INIT, vy = VY_INIT) {
    super(0);
    this.crashed = 0;
    this.sledBroken = 0;

    _.assign(this, makeRider());

    this.initPosAndVel(x, y, vx, vy);
  }

  initPosAndVel(x, y, vx, vy) {
    this.points.concat(this.scarfPoints).forEach(p => {
      p.pos.add({ x: x, y: y });
      p.prevPos.set(p.pos).subtract({ x: vx, y: vy });
    });
  }

  static getFlutter(base, seed) {
    let speed = Math.sqrt(base.vel.magnitude());
    let randMag = (seed.x * seed.y) % 1;
    let randAng = (seed.x + seed.y) % 1;
    randMag *= SCARF_FLUTTER_INTENSITY * speed * -Math.expm1(-speed / SPEED_THRESHOLD_FLUTTER);
    // randMag *= SCARF_FLUTTER_INTENSITY * speed * Math.log1p(speed / SPEED_THRESHOLD_FLUTTER);
    randAng *= 2 * Math.PI;
    return {
      x: randMag * Math.cos(randAng),
      y: randMag * Math.sin(randAng)
    };
  }
  stepPoint(point, gravity) {
    point.step(gravity);
  }
  stepScarf(gravity) {
    let base = this.scarfPoints[0];

    for (let i = 0; i < this.scarfPoints.length; i++) {
      let seed = (i > 0) ? this.scarfPoints[i-1] : base;
      let flutter = Rider.getFlutter(base, seed);
      this.scarfPoints[i].pos.add(flutter);
      this.scarfPoints[i].step(gravity);
    }
    for (let i = 0; i < this.scarfConstraints.length; i++) {
      this.scarfConstraints[i].resolve();
    }
  }
  stepConstraint(constraint, i) { // eslint-disable-line no-unused-vars
    let didCrash = +constraint.resolve(this.crashed);
    this.crashed = this.crashed || +didCrash;
  }
  getSolidLines(lineStore, point) {
    return lineStore.getSolidLinesAt(point.x, point.y);
  }
  stepCollision(point, line, i) { // eslint-disable-line no-unused-vars
    line.collide(point);
  }
  stepJoint(joint, i) {
    let didCrash = joint.resolve();

    this.crashed = this.crashed || +didCrash;
    this.sledBroken = this.sledBroken || +(i === STRING_PEG_TAIL.id && didCrash);
  }
  stepCrash() {
    if (this.crashed) {
      this.crashed += 1;
    }
    if (this.sledBroken) {
      this.sledBroken += 1;
    }
  }
  step(lineStore, gravity = GRAVITY) {
    let collidedLines = [];
    // normally i would avoid for loops but lots of iterations here
    for (let i = 0; i < this.points.length; i++) {
      this.stepPoint(this.points[i], gravity);
    }
    for (let i = 0; i < ITERATE; i++) {
      for (let idx = 0; idx < this.constraints.length; idx++) {
        this.stepConstraint(this.constraints[idx], i);
      }
      for(let idx = 0; idx < this.points.length; idx++) {
        let point = this.points[idx];
        let lines = this.getSolidLines(lineStore, point);
        collidedLines = collidedLines.concat(lines);
        for (let j = 0; j < lines.length; j++) {
          this.stepCollision(point, lines[j], i);
        }
      }
    }

    this.stepScarf(gravity);

    for (let i = 0; i < this.joints.length; i++) {
      this.stepJoint(this.joints[i], i);
    }

    this.stepCrash();

    return collidedLines
  }

  getCellKeys(lineStore) {
    let cellKeys = Object.create(null);

    this.points.forEach(({x, y}) => {
      lineStore.getCellKeysAt(x, y).forEach(key => {
        cellKeys[key] = key
      })
    })

    return _.values(cellKeys)
  }

  copyState() {
    return copyRider(this);
  }

  getState() {
    return {
      crashed: this.crashed,
      sledBroken: this.sledBroken,
      points: _.map(this.points, point => point.copyState()),
      scarfPoints: _.map(this.scarfPoints, point => point.copyState()),
      bodyParts: this.getBodyParts(),
      position: this.getPosition()
    };
  }
  setState(state) {
    this.crashed = state.crashed;
    this.sledBroken = state.sledBroken;
    _.forEach(this.points, (point, i) => {
      point.setState(state.points[i]);
    });
    _.forEach(this.scarfPoints, (point, i) => {
      point.setState(state.scarfPoints[i]);
    });
  }

  getBodyParts(p) {
    return getBodyParts(this, p);
  }

  getPosition() {
    return _.reduce(_.drop(this.points, 4),
      (pos, point) => pos.add(point.pos),
      new Vector(0, 0))
    .divS(this.points.length - 4);
  }

}

module.exports = Rider;
