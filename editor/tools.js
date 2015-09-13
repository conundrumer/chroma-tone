'use strict';

import _ from 'lodash'
import {Vec2} from 'core'
import { setCam, addLine, removeLine, replaceLine, pushAction, selectLine, addBall, replaceBall, removeBall } from './actions';
import {getClosestEntity, getDistanceFromWire} from 'core'

const Vector = Vec2;

export function debugTool(stream, dispatch, getState) {
  stream.first().subscribe(pos => {
    console.log('start', pos.x, pos.y);
  });
  return {
    stream: stream.skip(1),
    onNext: () => console.log('move'),
    onCancel: () => console.log('cancel'),
    onEnd: () => console.log('end')
  };
}

export function pan(stream, dispatch, getState) {
  var firstPos;
  stream.first().subscribe( pos => {
    firstPos = pos;
  });
  var { x, y, z } = getState().viewport;
  return {
    stream: stream.map((pos) =>
      firstPos.clone().subtract(pos).mulS(z).add({x, y})
    ),
    onNext: (trackPos) => dispatch(setCam({x: trackPos.x, y: trackPos.y, z})),
    onCancel: () => dispatch(setCam({x, y, z}))
  };

}

function getAbsPos(relPos, getState) {
  var { viewport: {w, h, x, y, z} } = getState();
  return relPos.clone().subtract({x: w/2, y: h/2}).mulS(z).add({x, y});
}

const MAX_SNAP_DISTANCE = 8
function getSnappedPos(absPos, getState, ignoreLineID) {
  return absPos
  // var { viewport: {z} } = getState();
  // let track = getTrackFromCache(getState)

  // // adjust snap radius to current zoom level
  // var maxSnap = MAX_SNAP_DISTANCE * Math.max(z, ZOOM.MIN * 10)

  // return track.getLinesInRadius(absPos.x, absPos.y, maxSnap)
  //   .filter(line =>
  //     // skip our ignoreline if given
  //     // because it represents the current line we're drawing
  //     line.id !== ignoreLineID
  //   )
  //   .reduce((points, line) =>
  //     // create array of points from array of lines
  //     points.concat([line.p, line.q])
  //   , [])
  //   .reduce(([snapPos, closestDistance], point) => {
  //     // reduce array of points to the point closest to absPos within maxSnap
  //     let distance = absPos.distance(point)
  //     return distance < closestDistance
  //       ? [point, distance]
  //       : [snapPos, closestDistance]
  //   }, [absPos, maxSnap])[0]
  //   .clone() // vectors are mutable, defensively copy them
}

const ZOOM = {
  STRENGTH: Math.pow(2, 1/(2<<5)),
  MAX: 2<<4,
  MIN: 1/(2<<4)
};
function getZoom(z, delta) {
  let dz = Math.pow(ZOOM.STRENGTH, delta);
  return Math.min(Math.max(z / dz, ZOOM.MIN), ZOOM.MAX);
}
function getPosFromZoom(pos, center, zoom, initZoom) {
  return pos.clone().mulS(-1).add(center).mulS(zoom / initZoom).add(pos)
}
export function zoom(stream, dispatch, getState) {
  var firstPos, y0;
  var { viewport: {x, y, z} } = getState();
  stream.first().subscribe( pos => {
    y0 = pos.y;
    firstPos = getAbsPos(pos, getState);
  });
  return {
    stream: stream.map(pos => getZoom(z, y0 - pos.y)),
    onNext: (zoom) => {
      let pos = getPosFromZoom(firstPos, {x, y}, zoom, z)
      dispatch(setCam({x: pos.x, y: pos.y, z: zoom}));
    },
    onCancel: () => dispatch(setCam({x, y, z}))
  };

}

export function deltaPanModZoom(pos, delta, dispatch, getState) {
  var { viewport: {x, y, z}, modKeys: {mod} } = getState();
  let newPos
  let zoom = z
  if (mod) { // zoom
    zoom = getZoom(z, delta.y)
    newPos = getPosFromZoom(getAbsPos(pos, getState), {x, y}, zoom, z)
  } else { // pan
    newPos = delta.mulS(z).add({x, y})
  }
  dispatch(setCam({
    x: newPos.x,
    y: newPos.y,
    z: zoom
  }))
}

// TODO: round according to zoom factor
const ANGLE_INC = 15
function angleSnap(pnt, pos) {
  let delta = pnt.clone().subtract(pos)
  let angle = Math.atan2(delta.y, delta.x) / Math.PI * 180
  angle = Math.round(angle / ANGLE_INC) * ANGLE_INC
  let [x, y] = (() => {
    switch (angle) {
      case 360:
      case 0:
        return [1, 0]
      case 90:
        return [0, 1]
      case 180:
        return [-1, 0]
      case 270:
        return [0, -1]
      default:
        let rads = angle / 180 * Math.PI
        return [Math.cos(rads), Math.sin(rads)]
    }
  })()
  return (new Vector(x, y)).mulS(delta.dot({x, y})).add(pos)
}
function distanceSnap(pnt, pos) {
  let delta = pnt.clone().subtract(pos)
  let newLength = Math.pow(2, ((Math.log2(delta.length()) * 12 + 0.5) | 0) / 12)
  return delta.unit().mulS(newLength).add(pos)
}

const getTension = lineType => [1, 0.825, 0][lineType]

// TODO: put ID management in reducer
// TODO: make minimum line length depend on zoom
const MIN_LINE_LENGTH = 1;
export function line(stream, dispatch, getState) {
  let p1
  let prevLine = null
  let id = getState().simStatesData.nextID;
  // TODO: wrap functions around mod keys for clarity
  stream = stream.map(pos => {
    let absPos = getAbsPos(pos, getState)
    let {modKeys: {alt}} = getState()
    if (!alt) {
      return getSnappedPos(absPos, getState, prevLine ? prevLine.id : null)
    }
    return absPos
  })

  stream.first().subscribe( pos => {
    p1 = pos
  });
  return {
    stream: stream
      .filter(p2 => p1.distance(p2) >= MIN_LINE_LENGTH),
    onNext: (p2) => {
      let {toolbars: {colorSelected: lineType}, modKeys: {mod, shift}} = getState()
      if (mod) {
        p2 = angleSnap(p2, p1)
      } if (!shift) {
        p2 = distanceSnap(p2, p1)
      }
      let lineData = {
        // x1: p1.x,
        // y1: p1.y,
        // x2: p2.x,
        // y2: p2.y,
        p: p1,
        q: p2,
        id: id,
        t: getTension(lineType)
        // flipped: shift,
        // type: lineType
      }
      let action
      if (prevLine) {
        action = replaceLine(prevLine, lineData)
      } else {
        action = addLine(lineData)
      }
      dispatch(action)
      prevLine = lineData
    },
    onEnd: () => {
      if (prevLine) {
        dispatch(pushAction(addLine(prevLine)))
      }
    },
    onCancel: () => {
      if (prevLine) {
        dispatch(removeLine(prevLine))
      }
    }
  }
}
export function marble(stream, dispatch, getState) {
  stream = stream.map((pos) => getAbsPos(pos, getState))
  let prevBall
  let p1
  let id = getState().simStatesData.nextID;
  stream.first().subscribe( pos => {
    p1 = pos
  })
  return {
    stream: stream,
    onNext: (p2) => {
      let {modKeys: {mod}} = getState()
      if (mod) {
        p2 = angleSnap(p2, p1)
      }
      let vel = p2.clone().subtract(p1)
      let speed = vel.length()
      if (speed > 5) {
        vel = vel.unit().mulS(Math.sqrt(speed))
      } else {
        vel = vel.setAxes(0, 0) // need to surpass
      }
      let ball = {id, p: p1, v: vel}
      let action
      if (prevBall) {
        action = replaceBall(prevBall, ball)
      } else {
        action = addBall(ball)
      }
      dispatch(action)
      prevBall = ball
    },
    onEnd: () => {
      dispatch(pushAction(addBall(prevBall)))
    },
    onCancel: () => {
      if (prevBall) {
        dispatch(removeBall(prevBall))
      }
    }
  }
}
export function pencil(stream, dispatch, getState) {
  stream = stream.map((pos) => getAbsPos(pos, getState))
  let p0
  let addedLines = []
  stream.first().subscribe( pos => {
    p0 = pos
  });
  return {
    stream: stream
      .scan(([prevLine, p1], p2) => {
        if (p1.distance(p2) >= 3 * MIN_LINE_LENGTH) {
          return [[p1, p2], p2]
        }
        return [null, p1]
      }, [null, p0])
      .map(([prevLine, p1]) => prevLine)
      .filter(prevLine => prevLine !== null),
    onNext: ([p1, p2]) => {
      let {toolbars: {colorSelected: lineType}, modKeys: {shift}} = getState()
      let lineData = {
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        flipped: shift,
        id: getState().maxID + 1,
        type: lineType
      }
      dispatch(addLine(lineData))
      addedLines.push(lineData);
    },
    onEnd: () => {
      if (addedLines.length > 0) {
        dispatch(pushAction(addLine(addedLines)))
      }
    },
    onCancel: () => {
      dispatch(removeLine(addedLines))
    }
  }
}

const ERASER_RADIUS = 2;
export function eraser(stream, dispatch, getState, cancellableStream) {
  var removedBalls = [];
  var removedWires = [];
  return {
    stream: cancellableStream.map((pos) => getAbsPos(pos, getState)),
    onNext: (pos) => {
      let simState = getState().simStatesData.simStates[0]
      let ballsToRemove = simState.balls.filter(ball => ball.p.distance(pos) < ERASER_RADIUS)
      removedBalls = removedBalls.concat(ballsToRemove)
      let wiresToRemove = simState.wires.filter(wire => getDistanceFromWire(wire, pos, ERASER_RADIUS))
      removedWires = removedWires.concat(wiresToRemove)
      dispatch(removeLine(wiresToRemove));
      dispatch(removeBall(ballsToRemove));
    },
    onEnd: () => {
      if (removedWires.length > 0) {
        dispatch(pushAction(removeLine(removedWires)))
      }
      if (removedBalls.length > 0) {
        dispatch(pushAction(removeBall(removedBalls)))
      }
    },
    onCancel: () => {
      // nvm
      dispatch(addLine(removedWires))
      dispatch(addBall(removedBalls))
    }
  }
}

const DragTypes = {
  BALL: 0,
  P: 1,
  Q: 2,
  LINE: 3, // bit flags ok???
}
const SELECTION_RADIUS = 10
function getDragType(pos, line, radius) {
  if (!line.q) {
    return DragTypes.BALL
  }
  let vec = line.q.clone().subtract(line.p)
  if (vec.mulS(0.5).add(line.p).distance(pos) < (radius / 2)) {
    return DragTypes.LINE
  }
  let pDist = line.p.distance(pos)
  let qDist = line.q.distance(pos)
  if (pDist > radius && qDist > radius) {
    return DragTypes.LINE
  }
  if (pDist < qDist) {
    return DragTypes.P
  } else {
    return DragTypes.Q
  }
}

// TODO: separate into separate streams and clean up
export function select(stream, dispatch, getState, cancellableStream) {
  let firstPos
  let selectedLineID = null
  let prevLine = null
  let modifyingLine = null
  let dragType
  let {viewport: {z}, lineSelection: {lineID: prevSelectedLineID}} = getState()
  // let track = getTrackFromCache(getState)
  let radius = SELECTION_RADIUS * z
  stream = cancellableStream.map((pos) => getAbsPos(pos, getState))
  stream.first().subscribe(pos => {
    firstPos = pos
    let simState = getState().simStatesData.simStates[0]
    let closestEntity = getClosestEntity(simState, firstPos, radius)
    if (prevSelectedLineID != null) {
      let line = _.filter(simState.balls.concat(simState.wires), {id: prevSelectedLineID})[0]
      if (line && closestEntity && line.id === closestEntity.id) {
        modifyingLine = line
        prevLine = line
        dragType = getDragType(pos, line, radius)
        selectedLineID = prevSelectedLineID
        return
      }
    }
    let selectedLine = closestEntity
    if (selectedLine) {
      selectedLineID = selectedLine.id
    }
  })
  return {
    stream: stream.skip(1),
    onNext: (pos) => {
      if (modifyingLine != null) {
        let {modKeys: {mod, alt, shift}} = getState()
        let delta = pos.clone().subtract(firstPos)
        let {p, q} = modifyingLine
        if (dragType === DragTypes.BALL) {
          draggedLine = {...modifyingLine, p: modifyingLine.p.clone().add(delta)}
          dispatch(replaceBall(modifyingLine, draggedLine))
          prevLine = draggedLine
          return
        }
        if (dragType & DragTypes.P) {
          p = p.clone().add(delta)
        }
        if (dragType & DragTypes.Q) {
          q = q.clone().add(delta)
        }
        if (mod) {
          if (dragType === DragTypes.P) {
            p = angleSnap(p, q)
          }
          if (dragType === DragTypes.Q) {
            q = angleSnap(q, p)
          }
        }
        if (!alt && !mod) {
          let snap
          if (dragType === DragTypes.P) {
            snap = getSnappedPos(p, getState, selectedLineID)
            if (!snap.equals(q)) {
              p = snap
            }
          }
          if (dragType === DragTypes.Q) {
            snap = getSnappedPos(q, getState, selectedLineID)
            if (!snap.equals(p)) {
              q = snap
            }
          }
        }
        if (!shift) {
          if (dragType === DragTypes.P) {
            p = distanceSnap(p, q)
          }
          if (dragType === DragTypes.Q) {
            q = distanceSnap(q, p)
          }
        }
        if (p.equals(q)) {
          return
        }
        let draggedLine = _.clone(modifyingLine)
        draggedLine.p = p
        draggedLine.q = q
        dispatch(replaceLine(prevLine, draggedLine))
        prevLine = draggedLine
      }
    },
    onEnd: () => {
      if (modifyingLine != null) {
        if (_.eq(modifyingLine, prevLine)) {
          return;
        }
        if (!modifyingLine.q) {
          dispatch(pushAction(replaceBall(modifyingLine, prevLine)))
        } else {
          dispatch(pushAction(replaceLine(modifyingLine, prevLine)))
        }
      } else {
        dispatch(selectLine(selectedLineID))
      }
    },
    onCancel: () => {
      if (modifyingLine != null) {
        dispatch(replaceLine(prevLine, modifyingLine))
      }
    }
  }
}
