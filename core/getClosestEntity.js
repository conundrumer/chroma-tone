
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
  let lengthSq = v.lengthSq()
  return lengthSq > 0 ? v.clone().mulS(u.dot(v) / v.lengthSq()) : lengthSq
}


function getDistanceFromWire(wire, point, r) {
  // true if part or all of the line is in the given radius
  let offset = vec(point, wire.p).mulS(-1)
  let wireVec = vec(wire.p, wire.q)
  let pComp = perpComp(norm(wireVec), offset);
  // not within distance of infinite line

  if (Math.abs(pComp) > r) {
    return false;
  }
  let linePos = wireVec.dot(offset) / wireVec.lengthSq()
  // within boundaries of endpoints or radius of either endpoints
  if (linePos > 0 && linePos < 1) {
    return pComp * pComp;
  }
  let rSq = r * r;
  // within radius of either endpoints
  let dist = Math.min(wire.p.distanceSq(point) < rSq, wire.q.distanceSq(point) < rSq)
  return dist < r && dist
}

export default function getClosestEntity({balls, wires}, point, maxRadius) {
  let [d1, closestBall] = balls.reduce(([closestDistanceSq, closestBall], ball) => {
    let distanceSq = ball.p.distanceSq(point)
    if (closestDistanceSq < 0 && distanceSq < maxRadius * maxRadius) return [distanceSq, ball]
    return distanceSq < closestDistanceSq ? [distanceSq, ball] : [closestDistanceSq, closestBall]
  }, [-1, null])
  let [d2, closestWire] = wires.reduce(([closestDistanceSq, closestWire], wire) => {
    let distanceSq = getDistanceFromWire(wire, point, maxRadius)
    if (distanceSq !== false && closestDistanceSq < 0) return [distanceSq, wire]
    return distanceSq < closestDistanceSq && distanceSq < maxRadius * maxRadius ? [distanceSq, wire] : [closestDistanceSq, closestWire]
  }, [-1, null])
  if (closestBall && !closestWire) return closestBall
  if (closestWire && !closestBall) return closestWire
  if (closestWire && closestBall && d1 > 0 && d2 > 0) {
    if (d1 < d2) {
      return closestBall
    }
    return closestWire
  }
  return null
}