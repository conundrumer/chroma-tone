var RiderMaker = require('./RiderMaker');

class RiderCopier extends RiderMaker {

  static copyRider(rider) {
    // if there is poor performance from instantiating this class everytime this function is called
    // i could use a private global variable for this module instead of instantiation
    // but you're not supposed to clone too often anyways, let me speak java in peace
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
