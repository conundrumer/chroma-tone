import stepBall from './stepBall'
import SimState from './SimState'
import Collision, {CollisionType} from './Collision'
import _ from 'lodash'

import rayVsCircle from 'ray-vs-circle'
import { intersect } from 'intersection'

const GRAVITY = { x: 0, y: 0.175 }
const AIR_FRICTION = 0

function vec(p, q) {
  return q.clone().subtract(p)
}

function norm(vec) {
  return vec.rotateRight().unit()
}

function perpComp(norm, offset) {
  return norm.dot(offset);
}

function project(u, v) {
  return v.clone().mulS(u.dot(v) / v.lengthSq())
}

function getCloserIntersection(a, b) {
  if (a && !b) {
    return a
  } else if (!a && b) {
    return b
  } else if (a && b) {
    if (a.toi < b.toi) {
      return a
    } else {
      return b
    }
  }
  return null
}

function getCollision({cur, next}, wire) {
  let lowerToi = 0
  let r = cur.r + wire.r
  let ballDisplacement = vec(cur.p, next.p)
  let ballDistanceTraveledSq = vec(cur.p, next.p).lengthSq()
  let ray = {start: cur.p, end: next.p}
  let thicknessOffset = norm(vec(wire.p, wire.q)).mulS(r)
  let segmentA = {
    start: wire.p.clone().add(thicknessOffset),
    end: wire.q.clone().add(thicknessOffset)
  }
  let segmentB = {
    start: wire.p.clone().subtract(thicknessOffset),
    end: wire.q.clone().subtract(thicknessOffset)
  }
  let circleP = {
    position: wire.p,
    radius: r
  }
  let circleQ = {
    position: wire.q,
    radius: r
  }
  let intersectionA = intersect(ray, segmentA)
  let intersectionB = intersect(ray, segmentB)
  let intersectionP = rayVsCircle(ray, circleP)
  let intersectionQ = rayVsCircle(ray, circleQ)

  let a = intersectionA && {
    intersection: intersectionA,
    displacement: thicknessOffset,
    toi: vec(intersectionA, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq
  }
  let b = intersectionB && {
    intersection: intersectionB,
    displacement: thicknessOffset.clone().mulS(-1),
    toi: vec(intersectionB, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq
  }
  let p = intersectionP && {
    intersection: intersectionP,
    displacement: vec(intersectionP, wire.p).mulS(-1),
    toi: vec(intersectionP, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq
  }
  let q = intersectionQ && {
    intersection: intersectionQ,
    displacement: vec(intersectionQ, wire.q).mulS(-1),
    toi: vec(intersectionQ, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq
  }
  return [a, b, p, q]
    .filter(x => x !== null)
    .filter(x => x.toi >= lowerToi && x.toi <= 1)
    .reduce(getCloserIntersection, null)
}

// do it naively for now, O(n^2) collision checking
// damn that's bad
// also don't check for ball_ball collisions, keep it simple
// each ball only gets zero or one collisions because fk this sht
function getCollisionsNaively(steppedBalls, wires) {
  return _(steppedBalls).map(steppedBall =>
    _(wires).map(wire =>
      getCollision(steppedBall, wire)
    ).reduce(getCloserIntersection, null)
  ).value()
}

// should return simState
export default function step(simState) {
  let steppedBalls = simState.balls.map(ball => stepBall(ball, GRAVITY, AIR_FRICTION))
  let collisions = getCollisionsNaively(steppedBalls, simState.wires)
  return SimState(steppedBalls.map(steppedBall => steppedBall.next), simState.wires, collisions)
}
