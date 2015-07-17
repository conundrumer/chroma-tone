/* rider.js
 * The Line Rider ragdoll entity. Has limbs and physics and stuff.
 */

/*eslint no-multi-spaces: 0 comma-spacing: 0*/
/*eslint no-loop-func: 0*/
'use strict';

var _ = require('lodash');
var clone = require('clone');

var {
  Point,
  Stick,
  BindStick,
  RepelStick,
  ScarfStick
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
    airFriction: 0.9,
    p: SHOULDER,
    numSegments: 7,
    segmentLength: 2
  };

// var oldCollisions = [];

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
class Rider {
  constructor(x, y, vx, vy, debug) {
    // oldCollisions = [];

    this.debug = debug || false;
    this.crashed = false;

    vx = vx || (vx === 0 ? vx : VX_INIT);
    vy = vy || (vy === 0 ? vy : VY_INIT);

    this.points = POINTS.map( p =>
      new Point(p.xInit, p.yInit, p.friction)
    );

    this.constraints = CONSTRAINTS.map( c => {
      let p = this.points[c.p.id];
      let q = this.points[c.q.id];
      switch(c.type) {
        case STICK:
          return new Stick(p, q);
        case BIND_STICK:
          return new BindStick(p, q, ENDURANCE);
        case REPEL_STICK:
          let stick = new RepelStick(p, q);
          stick.restLength *= 0.5;
          return stick;
      }
      throw new Error('Unknown constraint type');
    });

    this.scarfPoints = [];
    this.scarfConstraints = [];

    for (let i = 0; i < SCARF.numSegments; i++) {
      let p = (i === 0) ? this.points[SHOULDER.id] : this.scarfPoints[i-1];
      let q = new Point(p.x - SCARF.segmentLength, p.y, 0, SCARF.airFriction);
      this.scarfPoints.push(q);
      this.scarfConstraints.push(new ScarfStick(p, q));
    }

    this.points.concat(this.scarfPoints).forEach(p => {
      p.x += x;
      p.y += y;
      p.vx = p.x - vx;
      p.vy = p.y - vy;
    });

  }

  jiggleScarf() {
    let shoulder = this.points[SHOULDER.id];
    let points = this.scarfPoints;
    points[1].x = points[1].x + Math.random() * 0.3 * -Math.min(shoulder.dx, 125);
    points[1].y = points[1].y + Math.random() * 0.3 * -Math.min(shoulder.dy, 125);
  }

  clone() {
    let copy = clone(this);
    delete copy.states;
    return copy;
  }

  get bodyParts() {
    let getPosition = (p, q) => {
      return {
        x: p.x,
        y: p.y,
        angle: Math.atan2(q.y - p.y, q.x - p.x)
      };
    };

    let bodyParts = {};
    BODY_PARTS.forEach(bodyPart => {
      let p = this.points[bodyPart.p.id];
      let q = this.points[bodyPart.q.id];
      bodyParts[bodyPart.name] = getPosition(p, q);
    });

    bodyParts.scarf = [];
    for (let i = 0; i < this.scarfConstraints.length; i++) {
      let p = (i === 0) ? this.points[SHOULDER.id] : this.scarfPoints[i-1];
      let q = this.scarfPoints[i];
      bodyParts.scarf.push(getPosition(p, q));
    }
    return bodyParts;
  }

  step(lineStore, gravity) {
    // var collisions = [];

    gravity = gravity || GRAVITY;

    // this.debugResetSavedStates();
    // this.debugSaveState('start');

    this.points.forEach( p => p.step(gravity) );

    // this.debugSaveState('points stepped', {
    //   points: this.points.map( (p, i) => i )
    // });

    this.jiggleScarf();

    // this.debugSaveState('pre-iterate (scarf jiggled)', {
    //   scarfPoints: this.scarfPoints.map( (p, i) => i )
    // });

    this.scarfPoints.forEach( p => p.step(gravity) );

    for (let i = 0; i < ITERATE; i++) {

      this.constraints.forEach( (c, j) => {
        let alreadyCrashed = this.crashed;
        this.crashed = c.resolve(this.crashed);

        // this.debugSaveState(i.toString() + ': resolved constraint ' + j, {
        //   constraints: [j]
        // });

        if (!alreadyCrashed && this.crashed) {
          console.log('craSHED!12UI4!!~');
          if (this.debug) {
            // console.log(this.states);
          }

        }
      });

      this.points.forEach( p => lineStore.getSolidLinesAt(p.x, p.y).forEach( line => {
        line.collide(p);
        // if (this.debug) {
        //   collisions.push('iter ' + i.toString() + ', point ' + p.id + ', line ' + line.id);
        // }
      } ) );
    }

    this.scarfConstraints.forEach( c => c.resolve() );

    // this.debugSaveState('end (scarf resolved)', {
    //   scarfConstraints: this.scarfConstraints.map( (c, i) => i )
    // });
    // oldCollisions = collisions;
  }

  // debugResetSavedStates() {
  //   if (this.debug) {
  //     this.states = [];
  //   }
  // }

  // // when you need to debug the debugger.......
  // debugSaveState(description, changed) {
  //   if (this.debug) {
  //     // console.log(description, changed);
  //     changed = changed || {};

  //     let points = clone(this.points);

  //     let state = {
  //       points: points,
  //       crashed: this.crashed,
  //       constraints: []
  //     };
  //     // console.log(state);

  //     let lines = changed.lines;
  //     delete changed.lines;
  //     _.map(changed, (entityIDs, entitiesName) => {
  //       changed[entitiesName] = entityIDs.map( i => state[entitiesName][i] );
  //     });
  //     this.states.push({
  //       description: description,
  //       changed: _.assign({
  //         points: [],
  //         constraints: [],
  //         scarfPoints: [],
  //         scarfConstraints: [],
  //         lines: lines || []
  //       }, changed),
  //       state: state
  //     });
  //   }
  // }

}


module.exports = Rider;
