var _ = require('lodash');

var {
  Points,
  Constraints,
  Joints,
  Scarf,
  ConstraintTypes: {
    STICK, BIND_STICK, REPEL_STICK
  }
} = require('./RiderBody');

var {
  Point,
  Stick,
  BindStick,
  RepelStick,
  ScarfStick,
  ClockwiseCrashJoint
} = require('../entities');

var riderMaker;

const ENDURANCE = 0.057;

class RiderMaker {

  static makeRider() {
    return riderMaker.makeRider();
  }

  makePoint(p) {
    return new Point(p.id, p.xInit, p.yInit, p.friction);
  }

  makeConstraint(c, p, q) {
    switch(c.type) {
      case STICK:
        return new Stick(c.id, p, q);
      case BIND_STICK:
        return new BindStick(c.id, p, q, ENDURANCE);
      case REPEL_STICK:
        let stick = new RepelStick(c.id, p, q);
        stick.restLength *= 0.5;
        return stick;
      default:
        throw new Error('Unknown constraint type');
    }
  }

  makeJoint(j, s, t) {
    return new ClockwiseCrashJoint(j.id, s, t);
  }

  makeScarfSegment(i, p) {
    let q = new Point(-i - 1, p.x - Scarf.segmentLength, p.y, 0, Scarf.airFriction);
    let stick = new ScarfStick(-i - 1, p, q);
    return [q, stick];
  }

  makePoints() {
    return _.values(Points).map( p => this.makePoint(p) );
  }

  makeConstraints(points) {
    return _.values(Constraints).map( c =>
      this.makeConstraint(c, points[c.p.id], points[c.q.id])
    );
  }

  makeScarf(points) {
    let scarfPoints = [];
    let scarfConstraints = [];

    for (let i = 0; i < Scarf.numSegments; i++) {
      let p = (i === 0) ? points[Scarf.p.id] : scarfPoints[i-1];
      let [q, stick] = this.makeScarfSegment(i, p);
      scarfPoints.push(q);
      scarfConstraints.push(stick);
    }

    return {scarfPoints, scarfConstraints};
  }

  makeJoints(constraints) {
    return _.values(Joints).map( j =>
      this.makeJoint(j, constraints[j.s.id], constraints[j.t.id])
    );
  }

  makeRider() {
    let points = this.makePoints();
    let constraints = this.makeConstraints(points);
    let joints = this.makeJoints(constraints);
    let {scarfPoints, scarfConstraints} = this.makeScarf(points);
    return {points, constraints, joints, scarfPoints, scarfConstraints};
  }

}

riderMaker = new RiderMaker();

module.exports = RiderMaker;
