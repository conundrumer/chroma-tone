var RiderMaker = require('./riderMaker');

class RiderCopier extends RiderMaker {

  static copyRider(rider) {
    return (new RiderCopier(rider)).makeRider();
  }

  constructor(rider) {
    super();
    this.rider = rider;
  }

  makePoint(p) {
    return this.rider.points[p.id].clone();
  }

  makeConstraint(c, p, q) {
    return this.rider.constraints[c.id].clone(p, q);
  }

  makeJoint(j, s, t) {
    return this.rider.joints[j.id].clone(s, t);
  }

  makeScarfSegment(i, p) {
    let q = this.rider.scarfPoints[i].clone();
    let stick = this.rider.scarfConstraints[i].clone(p, q);
    return [q, stick];
  }

  makeRider() {
    let rider = super.makeRider();
    rider.crashed = this.rider.crashed;
    rider.sledBroken = this.rider.sledBroken;
    return rider;
  }
}

module.exports = RiderCopier;
