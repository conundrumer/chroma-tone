/*eslint no-multi-spaces: 0 comma-spacing: 0*/

var _ = require('lodash');

var {
  Point,
  Stick,
  BindStick,
  RepelStick,
  ScarfStick,
  ClockwiseCrashJoint
} = require('./entities');

const
  ENDURANCE = 0.057,
  // enum
  STICK = 0,
  BIND_STICK = 1,
  REPEL_STICK = 2,
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
  // joints
  STRING_PEG_TAIL = { id: 0 , s: PEG_TAIL      , t: STRING_PEG },
  BODY_SLED =       { id: 1 , s: SHOULDER_BUTT , t: STRING_PEG },
  JOINTS = [ STRING_PEG_TAIL, BODY_SLED ],
  // body parts
  BODY_PARTS = [
    { name: 'sled'     , p: PEG      , q: STRING   },
    { name: 'body'     , p: BUTT     , q: SHOULDER },
    { name: 'leftArm'  , p: SHOULDER , q: LHAND    },
    { name: 'rightArm' , p: SHOULDER , q: RHAND    },
    { name: 'leftLeg'  , p: BUTT     , q: LFOOT    },
    { name: 'rightLeg' , p: BUTT     , q: RFOOT    }
  ],
  // scarf
  SCARF = {
    airFriction: 0.85,
    p: SHOULDER,
    numSegments: 7,
    segmentLength: 2
  };


function makePoints() {
  let points = POINTS.map( p => {
    let point = new Point(p.id, p.xInit, p.yInit, p.friction);
    return point;
  });
  return points;
}

function makeConstraints(points) {
  let constraints = CONSTRAINTS.map( c => {
    let stick;
    let p = points[c.p.id];
    let q = points[c.q.id];
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

  return constraints;
}

function makeScarf(points) {
  let scarfPoints = [];
  let scarfConstraints = [];

  for (let i = 0; i < SCARF.numSegments; i++) {
    let p = (i === 0) ? points[SCARF.p.id] : scarfPoints[i-1];
    let q = new Point(-i - 1, p.x - SCARF.segmentLength, p.y, 0, SCARF.airFriction);
    scarfPoints.push(q);
    scarfConstraints.push(new ScarfStick(-i - 1, p, q));
  }

  return {scarfPoints, scarfConstraints};
}

function makeJoints(constraints) {
  let joints = JOINTS.map( j =>
    new ClockwiseCrashJoint(j.id, constraints[j.s.id], constraints[j.t.id])
  );
  return joints;
}

function makeRider() {
  let points = makePoints();
  let constraints = makeConstraints(points);
  let joints = makeJoints(constraints);
  let {scarfPoints, scarfConstraints} = makeScarf(points);
  return {points, constraints, joints, scarfPoints, scarfConstraints};
}

function copyRider(self) {
  let copy = {};
  copy.points = _.map(self.points, point => point.clone());
  copy.constraints = _.map(self.constraints, (c, i) => {
    let cProps = CONSTRAINTS[i];
    return c.clone(copy.points[cProps.p.id], copy.points[cProps.q.id]);
  });

  copy.scarfPoints = _.map(self.scarfPoints, point => point.clone());
  copy.scarfConstraints = _.map(self.scarfConstraints, (c, i) => {
    let p = (i === 0) ? copy.points[SCARF.p.id] : copy.scarfPoints[i-1];
    let q = copy.scarfPoints[i];
    return c.clone(p, q);
  });

  copy.joints = _.map(self.joints, (j, i) => {
    let jProps = JOINTS[i];
    j.clone(copy.constraints[jProps.s.id], copy.constraints[jProps.t.id]);
  });

  copy.crashed = self.crashed;
  copy.sledBroken = self.sledBroken;
  return copy;
}


function getBodyParts(self) {
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
    let p = self.points[bodyPart.p.id];
    let q = self.points[bodyPart.q.id];
    bodyParts[bodyPart.name] = getPosition(p, q);
  });

  bodyParts.scarf = [];
  for (let i = 0; i < self.scarfConstraints.length; i++) {
    let p = (i === 0) ? self.points[SCARF.p.id] : self.scarfPoints[i-1];
    let q = self.scarfPoints[i];
    bodyParts.scarf.push(getPosition(p, q));
  }
  return bodyParts;
}

module.exports = {
  makeRider,
  copyRider,
  getBodyParts,
  STRING_PEG_TAIL
};
