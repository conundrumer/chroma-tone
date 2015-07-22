/* rider.js
 * The Line Rider ragdoll entity. Has limbs and physics and stuff.
 */

/*eslint no-multi-spaces: 0 comma-spacing: 0*/
'use strict';

var _ = require('lodash');

var {
  Entity,
  Point,
  Stick,
  BindStick,
  RepelStick,
  ScarfStick,
  ClockwiseCrashJoint
} = require('./entities');

// I should figure out a way to generalize bodies
const
  // enum
  STICK = 0,
  BIND_STICK = 1,
  REPEL_STICK = 2,
  // physics
  ITERATE = 6,
  GRAVITY = { x: 0, y: 0.175 },
  ENDURANCE = 0.057,
  VX_INIT = 0.4,
  VY_INIT = 0,
  SCARF_FLUTTER_INTENSITY = 0.2,
  SPEED_THRESHOLD_FLUTTER = 125, // as this gets smaller, the scarf intensifies faster while speed increases
  // points
  PEG      = { id: 0 , xInit: 0    , yInit: 0    , friction: 0.8 },
  TAIL     = { id: 1 , xInit: 0    , yInit: 5    , friction: 0   },
  NOSE     = { id: 2 , xInit: 15   , yInit: 5    , friction: 0   },
  STRING   = { id: 3 , xInit: 17.5 , yInit: 0    , friction: 0   },
  BUTT     = { id: 4 , xInit: 5    , yInit: 0    , friction: 0.8 },
  SHOULDER = { id: 5 , xInit: 5    , yInit: -5.5 , friction: 0.8 },
  LHAND    = { id: 6 , xInit: 11.5 , yInit: -5   , friction: 0.1 },
  RHAND    = { id: 7 , xInit: 11.5 , yInit: -5   , friction: 0.1 },
  LFOOT    = { id: 8 , xInit: 10   , yInit: 5    , friction: 0   },
  RFOOT    = { id: 9 , xInit: 10   , yInit: 5    , friction: 0   },
  POINTS = [ PEG, TAIL, NOSE, STRING, BUTT, SHOULDER, LHAND, RHAND, LFOOT, RFOOT ],
  // constraints
  PEG_TAIL         = { id: 0  , p: PEG      , q: TAIL   , type: STICK       },
  TAIL_NOSE        = { id: 1  , p: TAIL     , q: NOSE   , type: STICK       },
  NOSE_STRING      = { id: 2  , p: NOSE     , q: STRING , type: STICK       },
  STRING_PEG       = { id: 3  , p: STRING   , q: PEG    , type: STICK       },
  PEG_NOSE         = { id: 4  , p: PEG      , q: NOSE   , type: STICK       },
  STRING_TAIL      = { id: 5  , p: STRING   , q: TAIL   , type: STICK       },
  PEG_BUTT         = { id: 6  , p: PEG      , q: BUTT   , type: BIND_STICK  },
  TAIL_BUTT        = { id: 7  , p: TAIL     , q: BUTT   , type: BIND_STICK  },
  NOSE_BUTT        = { id: 8  , p: NOSE     , q: BUTT   , type: BIND_STICK  },
  SHOULDER_BUTT    = { id: 9  , p: SHOULDER , q: BUTT   , type: STICK       },
  SHOULDER_LHAND   = { id: 10 , p: SHOULDER , q: LHAND  , type: STICK       },
  SHOULDER_RHAND   = { id: 11 , p: SHOULDER , q: RHAND  , type: STICK       },
  BUTT_LFOOT       = { id: 12 , p: BUTT     , q: LFOOT  , type: STICK       },
  BUTT_RFOOT       = { id: 13 , p: BUTT     , q: RFOOT  , type: STICK       },
  SHOULDER_RHAND_2 = { id: 14 , p: SHOULDER , q: RHAND  , type: STICK       }, // DUPLICATE!
  SHOULDER_PEG     = { id: 15 , p: SHOULDER , q: PEG    , type: BIND_STICK  },
  STRING_LHAND     = { id: 16 , p: STRING   , q: LHAND  , type: BIND_STICK  },
  STRING_RHAND     = { id: 17 , p: STRING   , q: RHAND  , type: BIND_STICK  },
  LFOOT_NOSE       = { id: 18 , p: LFOOT    , q: NOSE   , type: BIND_STICK  },
  RFOOT_NOSE       = { id: 19 , p: RFOOT    , q: NOSE   , type: BIND_STICK  },
  SHOULDER_LFOOT   = { id: 20 , p: SHOULDER , q: LFOOT  , type: REPEL_STICK },
  SHOULDER_RFOOT   = { id: 21 , p: SHOULDER , q: RFOOT  , type: REPEL_STICK },
  CONSTRAINTS = [
    PEG_TAIL, TAIL_NOSE, NOSE_STRING, STRING_PEG, PEG_NOSE, STRING_TAIL,
    PEG_BUTT, TAIL_BUTT, NOSE_BUTT,
    SHOULDER_BUTT, SHOULDER_LHAND, SHOULDER_RHAND, BUTT_LFOOT, BUTT_RFOOT, SHOULDER_RHAND_2,
    SHOULDER_PEG, STRING_LHAND, STRING_RHAND, LFOOT_NOSE, RFOOT_NOSE,
    SHOULDER_LFOOT, SHOULDER_RFOOT
  ],
  // body parts
  BODY_PARTS = [
    { name: 'sled'     , p: PEG      , q: STRING   },
    { name: 'body'     , p: BUTT     , q: SHOULDER },
    { name: 'leftArm' , p: SHOULDER , q: LHAND    },
    { name: 'rightArm'  , p: SHOULDER , q: RHAND    },
    { name: 'leftLeg' , p: BUTT     , q: LFOOT    },
    { name: 'rightLeg'  , p: BUTT     , q: RFOOT    }
  ],
  // scarf
  SCARF = {
    airFriction: 0.85,
    p: SHOULDER,
    numSegments: 7,
    segmentLength: 2
  };

/* Rider
 * - creates a new rider at (x,y) and gives the rider velocity (vx, vy)
 *
 * public:
 * - crashed
 * - bodyParts
 * - step(collideFn(p, [debugHandler(line, lineID)]), [gravity])
 * - clone
 * - states < for debugging
 *
 * private:
 * - points
 * - constraints
 * - scarfPoints
 * - scarfConstraints
 */
class Rider extends Entity {
  constructor(x, y, vx = VX_INIT, vy = VY_INIT) {
    super(0);
    this.crashed = false;
    this.sledBroken = false;

    // TODO: separate rider state creation/management and physics
    this.makePoints();
    this.makeConstraints();
    this.makeScarf();
    this.makeJoints();

    this.initPosAndVel(x, y, vx, vy);
  }

  makePoints() {
    this.points = POINTS.map( p => {
      let point = new Point(p.id, p.xInit, p.yInit, p.friction);
      return point;
    });
  }
  makeConstraints() {
    this.constraints = CONSTRAINTS.map( c => {
      let stick;
      let p = this.points[c.p.id];
      let q = this.points[c.q.id];
      switch(c.type) {
        case STICK:
          stick = new Stick(c.id, p, q);
          break;
        case BIND_STICK:
          stick = new BindStick(c.id, p, q, ENDURANCE);
          break;
        case REPEL_STICK:
          stick = new RepelStick(c.id, p, q);
          stick.restLength *= 0.5;
          break;
        default:
          throw new Error('Unknown constraint type');
      }
      return stick;
    });
  }
  makeScarf() {
    this.scarfPoints = [];
    this.scarfConstraints = [];

    for (let i = 0; i < SCARF.numSegments; i++) {
      let p = (i === 0) ? this.points[SHOULDER.id] : this.scarfPoints[i-1];
      let q = new Point(-i - 1, p.x - SCARF.segmentLength, p.y, 0, SCARF.airFriction);
      this.scarfPoints.push(q);
      this.scarfConstraints.push(new ScarfStick(-i - 1, p, q));
    }
  }
  makeJoints() {
    let pegTail = this.constraints[PEG_TAIL.id];
    let stringPeg = this.constraints[STRING_PEG.id];
    let shoulderButt = this.constraints[SHOULDER_BUTT.id];
    this.joints = [
      new ClockwiseCrashJoint(0, pegTail, stringPeg),
      new ClockwiseCrashJoint(1, shoulderButt, stringPeg)
    ];
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
    speed *= 1 - Math.pow(2, -speed / SPEED_THRESHOLD_FLUTTER);
    randMag *= SCARF_FLUTTER_INTENSITY * speed;
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
    let base = this.points[SHOULDER.id];
    let seed = this.points[this.scarfPoints.length-1];
    let flutter = Rider.getFlutter(base, seed);
    this.scarfPoints[1].pos.add(flutter);

    for (let i = 0; i < this.scarfPoints.length; i++) {
      this.scarfPoints[i].step(gravity);
    }
    for (let i = 0; i < this.scarfConstraints.length; i++) {
      this.scarfConstraints[i].resolve();
    }
  }
  stepConstraint(constraint, i) {
    this.crashed = constraint.resolve(this.crashed);
  }
  getSolidLines(lineStore, point) {
    return lineStore.getSolidLinesAt(point.x, point.y);
  }
  stepCollision(point, line, i) {
    line.collide(point);
  }
  stepJoint(joint, i) {
    let didCrash = joint.resolve();

    this.crashed = this.crashed || didCrash;
    this.sledBroken = this.sledBroken || i === 0 && didCrash;
  }
  step(lineStore, gravity = GRAVITY) {
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
        for (let j = 0; j < lines.length; j++) {
          this.stepCollision(point, lines[j], i);
        }
      }
    }

    this.stepScarf(gravity);

    for (let i = 0; i < this.joints.length; i++) {
      this.stepJoint(this.joints[i], i);
    }
  }

  copyState() {
    let copy = {};
    copy.points = _.map(this.points, point => point.clone());
    copy.constraints = _.map(this.constraints, (c, i) => {
      let cProps = CONSTRAINTS[i];
      return c.clone(copy.points[cProps.p.id], copy.points[cProps.q.id]);
    });

    copy.scarfPoints = _.map(this.scarfPoints, point => point.clone());
    copy.scarfConstraints = _.map(this.scarfConstraints, (c, i) => {
      let p = (i === 0) ? copy.points[SHOULDER.id] : copy.scarfPoints[i-1];
      let q = copy.scarfPoints[i];
      return c.clone(p, q);
    });

    let pegTail = copy.constraints[PEG_TAIL.id];
    let stringPeg = copy.constraints[STRING_PEG.id];
    let shoulderButt = copy.constraints[SHOULDER_BUTT.id];
    copy.joints = [
      this.joints[0].clone(pegTail, stringPeg),
      this.joints[1].clone(shoulderButt, stringPeg)
    ];

    copy.crashed = this.crashed;
    copy.sledBroken = this.sledBroken;
    return copy;
  }

  getState() {
    return {
      crashed: this.crashed,
      sledBroken: this.sledBroken,
      // lazy atm, i can use arrays instead of cloned points
      points: _.map(this.points, point => point.copyState()),
      scarfPoints: _.map(this.scarfPoints, point => point.copyState())
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

  static getBodyParts(state) {
    let getPosition = (p, q) => {
      let vec = q.pos.clone().subtract(p.pos);
      return {
        x: p.x,
        y: p.y,
        angle: Math.atan2(vec.y, vec.x)
      };
    };

    let bodyParts = {};
    BODY_PARTS.forEach(bodyPart => {
      let p = state.points[bodyPart.p.id];
      let q = state.points[bodyPart.q.id];
      bodyParts[bodyPart.name] = getPosition(p, q);
    });

    bodyParts.scarf = [];
    for (let i = 0; i < state.scarfConstraints.length; i++) {
      let p = (i === 0) ? state.points[SHOULDER.id] : state.scarfPoints[i-1];
      let q = state.scarfPoints[i];
      bodyParts.scarf.push(getPosition(p, q));
    }
    return bodyParts;
  }

  getBodyParts() {
    return Rider.getBodyParts(this);
  }

}

class DebugRider extends Rider {

  step(lineStore, gravity) {
    // this.initializeDebuggingthing();
    super.step(lineStore, gravity);
  }

  stepPoint(point, gravity) {
    super.stepPoint(point, gravity);
  }

  stepConstraint(constraint, i) {
    let hasCrashed = this.crashed;

    super.stepConstraint(constraint, i);

    if (!hasCrashed && this.crashed) {
      console.log('craSHED!12UI4!!~');
    }
  }

  getSolidLines(lineStore, point) {
    // TODO make special debug method to get line's grid positions
    return lineStore.getSolidLinesAt(point.x, point.y);
  }

  stepCollision(point, line, i, cPos) {
    super.stepCollision(point, line, i, cPos);
  }

  stepJoint(joint, i) {
    let hasCrashed = this.crashed;

    super.stepJoint(joint, i);

    if (!hasCrashed && this.crashed) {
      if (i === 0) {
        console.log('crashed because the sled broke!!2e1r');
      } else {
        console.log('bosh attempted The Cripple. now he crashed !@#$');
      }
    }

  }
}

module.exports = {Rider, DebugRider};
