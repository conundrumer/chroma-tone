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
  return vec.clone().rotateRight().unit()
}

function perpComp(norm, offset) {
  return norm.dot(offset);
}

function project(u, v) {
  let lengthSq = v.lengthSq()
  return lengthSq > 0 ? v.clone().mulS(u.dot(v) / v.lengthSq()) : lengthSq
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

function getAABB(points) {
  if (points.length < 1) return null;
  let minX = points[0].x
  let minY = points[0].y
  let maxX = points[0].x
  let maxY = points[0].y
  for (let i = 0; i < points.length; i++) {
    let point = points[i]
    minX = point.x < minX ? point.x : minX
    minY = point.y < minY ? point.y : minY
    maxX = point.x > maxX ? point.x : maxX
    maxY = point.y > maxY ? point.y : maxY
  }
  return [minX, minY, maxX, maxY]
}

function AABBintersecting([aMinX, aMinY, aMaxX, aMaxY], [bMinX, bMinY, bMaxX, bMaxY]) {
  if (aMaxX < bMinX) return false
  if (aMinX > bMaxX) return false
  if (aMaxY < bMinY) return false
  if (aMinY > bMaxY) return false
  return true
}

function insideRect(p, a, b, c, d) {
  let ap = vec(a, p)
  let cp = vec(c, p)
  let abCrossAp = vec(a, b).cross(ap)
  let cdCrossCp = vec(c, d).cross(cp)
  if ((abCrossAp > 0 && cdCrossCp < 0) || (abCrossAp < 0 && cdCrossCp > 0)) {
    return false
  }
  let adCrossAp = vec(a, d).cross(ap)
  let cbCrossCp = vec(c, b).cross(cp)
  if ((adCrossAp > 0 && cbCrossCp < 0) || (adCrossAp < 0 && cbCrossCp > 0)) {
    return false
  }
  return true
}

function getCollision({cur, next, previouslyCollidedWith}, wire) {
  if (previouslyCollidedWith != null) {
    if (previouslyCollidedWith === wire.id) {
      return null // colliding with the same line consecutively causes bugs
    }
  }
  let r = cur.r + wire.r
  let ballAABB = getAABB([cur.p, next.p])
  let rOffset = {x: r, y: r}
  let wireAABB = getAABB([
    wire.p.clone().add(rOffset),
    wire.p.clone().subtract(rOffset),
    wire.q.clone().add(rOffset),
    wire.q.clone().subtract(rOffset)
  ])
  if (!AABBintersecting(ballAABB, wireAABB)) {
    return null
  }
  let ballDisplacement = vec(cur.p, next.p)
  let ballDistanceTraveledSq = vec(cur.p, next.p).lengthSq()
  let ray = {start: cur.p, end: next.p}
  let wireVec = vec(wire.p, wire.q)
  let thicknessOffset = norm(wireVec).mulS(r)
  let wireLength = wire.p.distance(wire.q)
  if (ballDistanceTraveledSq === 0) {
    return
  }
  let segmentA = {
    start: wire.p.clone().add(thicknessOffset),
    end: wire.q.clone().add(thicknessOffset)
  }
  let segmentB = {
    start: wire.p.clone().subtract(thicknessOffset),
    end: wire.q.clone().subtract(thicknessOffset)
  }
  if (insideRect(cur.p, segmentA.start, segmentA.end, segmentB.end, segmentB.start)) {
    let offset = vec(wire.p, cur.p)
    let linePos = offset.dot(wireVec) / (wireLength * wireLength)
    let normalForce = wireVec.cross(offset) > 0 ? thicknessOffset.clone() : thicknessOffset.clone().mulS(-1)
    return {
      intersection: wireVec.clone().mulS(linePos).add(normalForce).add(wire.p),
      normalForce: normalForce.unit(),
      toi: 0,
      wire: wire,
      wirePosition: 1 - 2 * Math.abs(linePos - 0.5)
    }
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
    wire: wire,
    wirePosition: 1 - 2 * Math.abs(vec(intersectionA, wire.p).length() / wireLength - 0.5)
  }
  let b = intersectionB && {
    intersection: intersectionB,
    normalForce: thicknessOffset.clone().mulS(-1).unit(),
    toi: vec(intersectionB, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq,
    wire: wire,
    wirePosition: 1 - 2 * Math.abs(vec(intersectionB, wire.p).length() / wireLength - 0.5)
  }
  // check for case when inside
  if (a && b) {
    if (a.toi < 0 && b.toi > 1) {
      return {...a, toi: 0}
    }
    if (a.toi > 1 && b.toi < 0) {
      return {...b, toi: 0}
    }
  }
  let p = intersectionP && {
    intersection: intersectionP,
    normalForce: vec(intersectionP, wire.p).mulS(-1).unit(),
    toi: vec(intersectionP, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq,
    wire: wire,
    wirePosition: 0
  }
  let q = intersectionQ && {
    intersection: intersectionQ,
    normalForce: vec(intersectionQ, wire.q).mulS(-1).unit(),
    toi: vec(intersectionQ, cur.p).mulS(-1).dot(ballDisplacement) / ballDistanceTraveledSq,
    wire: wire,
    wirePosition: 0
  }
  return [a, b, p, q]
    .filter(x => x !== null)
    .filter(x => x.toi > 0 && x.toi < 1)
    .reduce(getCloserIntersection, null)
}

function resolveCollision({cur, next, baseToi}, collision, forcefullyResolve = false) {
  let intersection = cur.p.clone().set(collision.intersection)
  let bounceDelta = project(vec(next.p, intersection), collision.normalForce).mulS(1 + collision.wire.t)
  let bounceVelDelta = project(next.v, collision.normalForce).mulS(-1).mulS(1 + collision.wire.t)
  return [
    makeCollision(collision, next, bounceVelDelta),
    {
      cur: Ball(cur.id, intersection, cur.v),
      next: Ball(next.id, forcefullyResolve ? intersection : next.p.clone().add(bounceDelta), next.v.clone().add(bounceVelDelta)),
      baseToi: baseToi + (1 - baseToi) * collision.toi,
      previouslyCollidedWith: collision.wire.id
    }]
}

function makeCollision({wire, toi, wirePosition}, ball, force) {
  return Collision(CollisionType.BALL_WIRE, [ball, wire], toi, force.length(), wirePosition)
}

// do it naively for now, O(n^2) collision checking
// damn that's bad
// also don't check for ball_ball collisions, keep it simple
// each ball only gets zero or one collisions because fk this sht
function getAndResolveCollisionsNaively(steppedBalls, wires, forcefullyResolve = false) {
  let [collisions, collidedBalls] = _(steppedBalls).map(steppedBall => {
    let collision = _(wires).map(wire =>
        getCollision(steppedBall, wire)
      ).reduce((closest, int) => getCloserIntersection(closest, int), null)
    if (collision && steppedBall.next.v.dot(collision.normalForce) < 0) { // velocity and normal must oppose each other
      return resolveCollision(steppedBall, collision, forcefullyResolve)
    }
    return [null, steppedBall]
  })
  .unzip().value()
  return [
    (collisions || []).filter(c => c),
    collidedBalls || []
  ]
}

function getAndResolveCollisions(steppedBalls, wires) {
  let totalCollisions = []
  let finalCollidedBalls = Object.create(null)
  let nextBallsToCollide = steppedBalls
  for (let i = 0; i < 20; i++) {
    let [collisions, collidedBalls] = getAndResolveCollisionsNaively(nextBallsToCollide, wires)
    totalCollisions = totalCollisions.concat(collisions)
    collidedBalls.forEach((collidedBall) => {
      finalCollidedBalls[collidedBall.next.id] = collidedBall
    })
    if (collisions.length === 0) {
      break;
    }
    nextBallsToCollide = collisions.map(({entities: [ball]}) => finalCollidedBalls[ball.id])
  }
  if (nextBallsToCollide.length > 0) {
    // make sure they don't phase through
    getAndResolveCollisionsNaively(nextBallsToCollide, wires, true)
  }
  return [totalCollisions.map(c => ({...c, force: c.force / totalCollisions.length})), _.values(finalCollidedBalls)]
}

// should return simState
export default function step(simState) {
  let steppedBalls = simState.balls.map(ball => stepBall(ball, GRAVITY, AIR_FRICTION))
  let [collisions, collidedBalls] = getAndResolveCollisions(steppedBalls, simState.wires)
  return SimState(collidedBalls.map(collidedBall => collidedBall.next), simState.wires, collisions)
}
