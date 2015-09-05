'use strict';

import Vector from 'core/Vector'
import { setCam, addLine, removeLine, replaceLine, pushAction, selectLine } from './actions';

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
  var { trackData: {track}, viewport: {z} } = getState();

  // adjust snap radius to current zoom level
  var maxSnap = MAX_SNAP_DISTANCE * Math.max(z, ZOOM.MIN * 10)

  return track.getLinesInRadius(absPos.x, absPos.y, maxSnap)
    .filter(line =>
      // skip our ignoreline if given
      // because it represents the current line we're drawing
      line.id !== ignoreLineID
    )
    .reduce((points, line) =>
      // create array of points from array of lines
      points.concat([line.p, line.q])
    , [])
    .reduce(([snapPos, closestDistance], point) => {
      // reduce array of points to the point closest to absPos within maxSnap
      let distance = absPos.distance(point)
      return distance < closestDistance
        ? [point, distance]
        : [snapPos, closestDistance]
    }, [absPos, maxSnap])[0]
    .clone() // vectors are mutable, defensively copy them
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

// TODO: put ID management in reducer
// TODO: make minimum line length depend on zoom
const MIN_LINE_LENGTH = 3;
var tempID = 0;
export function line(stream, dispatch, getState) {
  let p1
  let prevLine = null
  let id = tempID++; // TODO: make addLine responsible for getting actual ID!
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
  let {modKeys: {shift}} = getState()

  return {
    stream: stream
      .filter(p2 => p1.distance(p2) >= MIN_LINE_LENGTH),
    onNext: (p2) => {
      let {toolbars: {colorSelected: lineType}, modKeys: {mod}} = getState()
      if (mod) {
        p2 = angleSnap(p2, p1)
      }
      let lineData = {
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        id: id,
        flipped: shift,
        type: lineType
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
        if (p1.distance(p2) >= MIN_LINE_LENGTH) {
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
        id: tempID++,
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
  var removedLines = [];
  return {
    stream: cancellableStream.map((pos) => getAbsPos(pos, getState)),
    onNext: (pos) => {
      let linesToRemove = getState().trackData.track.getLinesInRadius(pos.x, pos.y, ERASER_RADIUS)
      removedLines = removedLines.concat(linesToRemove);
      dispatch(removeLine(linesToRemove));
    },
    onEnd: () => {
      if (removedLines.length > 0) {
        dispatch(pushAction(removeLine(removedLines)))
      }
    },
    onCancel: () => {
      dispatch(addLine(removedLines))
    }
  }
}

const DragTypes = {
  P: 1,
  Q: 2,
  LINE: 3 // bit flags ok???
}
const SELECTION_RADIUS = 10
function getDragType(pos, line, radius) {
  if (line.vec.clone().mulS(0.5).add(line.p).distance(pos) < (radius / 2)) {
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
  let {trackData: {track}, viewport: {z}, lineSelection: {lineID: prevSelectedLineID}} = getState()
  let radius = SELECTION_RADIUS * z
  stream = cancellableStream.map((pos) => getAbsPos(pos, getState))
  stream.first().subscribe(pos => {
    firstPos = pos
    if (prevSelectedLineID != null) {
      let line = track.getLineByID(prevSelectedLineID)
      if (line && line.inRadius(pos.x, pos.y, radius)) {
        modifyingLine = line
        prevLine = line
        dragType = getDragType(pos, line, radius)
        selectedLineID = prevSelectedLineID
        return
      }
    }
    let selectedLine = track.getLinesInRadius(pos.x, pos.y, radius)[0]
    if (selectedLine) {
      selectedLineID = selectedLine.id
    }
  })
  return {
    stream: stream.skip(1),
    onNext: (pos) => {
      if (modifyingLine != null) {
        let {modKeys: {mod, alt}} = getState()
        let delta = pos.clone().subtract(firstPos)
        let {p, q} = modifyingLine
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
        if (p.equals(q)) {
          return
        }
        let draggedLine = modifyingLine.setPoints(p, q)
        dispatch(replaceLine(prevLine, draggedLine))
        prevLine = draggedLine
      }
    },
    onEnd: () => {
      if (modifyingLine != null) {
        if (modifyingLine.equals(prevLine)) {
          return;
        }
        dispatch(pushAction(replaceLine(modifyingLine, prevLine)))
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
