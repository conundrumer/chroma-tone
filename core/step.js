import stepBall from './stepBall'
import SimState from './SimState'
import Collision, {CollisionType} from './Collision'
import Ball from './Ball'
import _ from 'lodash'

import rayVsCircle from 'ray-vs-circle'
import { checkIntersection } from 'line-intersect'

function intersect(segA, segB) {
  let {point: intersection} = checkIntersection(
    segA.start.x, segA.start.y, segA.end.x, segA.end.y,
    segB.start.x, segB.start.y, segB.end.x, segB.end.y
  )
  return intersection || null
}

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

function getCollision({cur, next, baseToi}, wire) {
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
    normalForce: thicknessOffset.unit(),
    toi: vec(intersectionA, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq,
    wire: wire
  }
  let b = intersectionB && {
    intersection: intersectionB,
    normalForce: thicknessOffset.clone().mulS(-1).unit(),
    toi: vec(intersectionB, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq,
    wire: wire
  }
  let p = intersectionP && {
    intersection: intersectionP,
    normalForce: vec(intersectionP, wire.p).mulS(-1).unit(),
    toi: vec(intersectionP, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq,
    wire: wire
  }
  let q = intersectionQ && {
    intersection: intersectionQ,
    normalForce: vec(intersectionQ, wire.q).mulS(-1).unit(),
    toi: vec(intersectionQ, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq,
    wire: wire
  }
  return [a, b, p, q]
    .filter(x => x !== null)
    .filter(x => x.toi >= baseToi && x.toi <= 1)
    .reduce(getCloserIntersection, null)
}

function resolveCollision({cur, next, baseToi}, collision) {
  console.log(collision)
  let intersection = cur.p.clone().set(collision.intersection)
  let bounceDelta = project(vec(next.p, intersection), collision.normalForce).mulS(1 + collision.wire.t)
  let bounceVelDelta = project(next.v, collision.normalForce).mulS(-1).mulS(1 + collision.wire.t)
  return {
    cur: Ball(cur.id, intersection, cur.v),
    next: Ball(next.id, next.p.clone().add(bounceDelta), next.v.clone().add(bounceVelDelta)),
    baseToi: collision.toi
  }
}

// do it naively for now, O(n^2) collision checking
// damn that's bad
// also don't check for ball_ball collisions, keep it simple
// each ball only gets zero or one collisions because fk this sht
function getAndResolveCollisionsNaively(steppedBalls, wires) {
  let [collisions, collidedBalls] = _(steppedBalls).map(steppedBall => {
    let collision = _(wires).map(wire =>
        getCollision(steppedBall, wire)
      ).reduce((closest, int) => getCloserIntersection(closest, int), null)
    return collision
      ? [collision, resolveCollision(steppedBall, collision)]
      : [null, steppedBall]
  })
  .unzip().value()
  return [
    collisions.filter(c => c),
    collidedBalls
  ]
}

// should return simState
export default function step(simState) {
  let steppedBalls = simState.balls.map(ball => stepBall(ball, GRAVITY, AIR_FRICTION))
  let [collisions, collidedBalls] = getAndResolveCollisionsNaively(steppedBalls, simState.wires)
  console.log(collisions, collidedBalls)
  return SimState(collidedBalls.map(collidedBall => collidedBall.next), simState.wires, collisions)
}
