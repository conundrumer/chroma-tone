/*eslint no-multi-spaces: 0 comma-spacing: 0*/
/*eslint key-spacing: 0 */
'use strict';

var _ = require('lodash');

const
  // enum
  STICK = 0,
  BIND_STICK = 1,
  REPEL_STICK = 2,
  ConstraintTypes = { STICK, BIND_STICK, REPEL_STICK },
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
  Points = { PEG, TAIL, NOSE, STRING, BUTT, SHOULDER, LHAND, RHAND, LFOOT, RFOOT },
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
  Constraints = {
    PEG_TAIL, TAIL_NOSE, NOSE_STRING, STRING_PEG, PEG_NOSE, STRING_TAIL,
    PEG_BUTT, TAIL_BUTT, NOSE_BUTT,
    SHOULDER_BUTT, SHOULDER_LHAND, SHOULDER_RHAND, BUTT_LFOOT, BUTT_RFOOT, SHOULDER_RHAND_2,
    SHOULDER_PEG, STRING_LHAND, STRING_RHAND, LFOOT_NOSE, RFOOT_NOSE,
    SHOULDER_LFOOT, SHOULDER_RFOOT
  },
  // joints
  STRING_PEG_TAIL = { id: 0 , s: PEG_TAIL      , t: STRING_PEG },
  BODY_SLED =       { id: 1 , s: SHOULDER_BUTT , t: STRING_PEG },
  Joints = { STRING_PEG_TAIL, BODY_SLED },
  // body parts
  BodyParts = {
    sled:     { p: PEG      , q: STRING   },
    body:     { p: BUTT     , q: SHOULDER },
    leftArm:  { p: SHOULDER , q: LHAND    },
    rightArm: { p: SHOULDER , q: RHAND    },
    leftLeg:  { p: BUTT     , q: LFOOT    },
    rightLeg: { p: BUTT     , q: RFOOT    }
  },
  // scarf
  Scarf = {
    airFriction: 0.8,
    p: SHOULDER,
    numSegments: 7,
    segmentLength: 2
  };

function getBodyParts(self) {
  let getPosition = (p, q) => {
    let vec = q.pos.clone().subtract(p.pos);
    return {
      x: p.x,
      y: p.y,
      angle: Math.atan2(vec.y, vec.x)
    };
  };

  let bodyParts = _.mapValues(BodyParts, ({p, q}) =>
    getPosition(self.points[p.id], self.points[q.id])
  );

  bodyParts.scarf = [];
  for (let i = 0; i < self.scarfConstraints.length; i++) {
    let p = (i === 0) ? self.points[Scarf.p.id] : self.scarfPoints[i-1];
    let q = self.scarfPoints[i];
    bodyParts.scarf.push(getPosition(p, q));
  }
  return bodyParts;
}

module.exports = {
  getBodyParts,
  Points,
  Constraints,
  Joints,
  Scarf,
  ConstraintTypes
};
