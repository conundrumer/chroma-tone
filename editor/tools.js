'use strict';

import Vector from 'core/Vector'
import { setCam, addLine, removeLine, replaceLine } from './actions';

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

const MAX_SNAP_DISTANCE = 11
function getSnappedPos(relPos, getState) {
  var { trackData: {lineStore}, viewport: {z} } = getState();

  var absPos = getAbsPos(relPos, getState);

  // adjust snap radious to current zoom level
  var maxSnap = MAX_SNAP_DISTANCE * Math.max(z, ZOOM.MIN * 10)

  var closestCoords = null;
  var closestDistance = null;

  lineStore.forEach(function(line) {
    // calculate first point
    if (((absPos.x - maxSnap) < line.p.x && line.p.x < (absPos.x + maxSnap))) {
      if (((absPos.y - maxSnap) < line.p.y && line.p.x < (absPos.y + maxSnap))) {
        var myDistance = absPos.distance(line.p)

        if ((closestDistance == null) || (myDistance < closestDistance)) {
          closestDistance = myDistance
          closestCoords = line.p
        }
      }
    }

    // calculate last point
    if (((absPos.x - maxSnap) < line.q.x &&  line.q.x < (absPos.x + maxSnap))) {
      if (((absPos.y - maxSnap) < line.q.y && line.q.y < (absPos.y + maxSnap))) {
        var myDistance = absPos.distance(line.q)

        if ((closestDistance == null) || (myDistance < closestDistance)) {
          closestDistance = myDistance
          closestCoords = line.q
        }
      }
    }
  });

  if (closestCoords != null) {
    absPos = closestCoords;
  }

  return absPos;
}

const ZOOM = {
  STRENGTH: Math.pow(2, 1/(2<<5)),
  MAX: 2<<4,
  MIN: 1/(2<<4)
};
export function zoom(stream, dispatch, getState) {
  var firstPos, y0;
  var { viewport: {w, h, x, y, z} } = getState();
  stream.first().subscribe( pos => {
    y0 = pos.y;
    firstPos = getAbsPos(pos, getState);
  });
  return {
    stream: stream.map((pos) => {
      let dz = Math.pow(ZOOM.STRENGTH, y0 - pos.y);
      return Math.min(Math.max(z / dz, ZOOM.MIN), ZOOM.MAX);
    }),
    onNext: (zoom) => {
      let pos = firstPos.clone().mulS(-1).add({x, y}).mulS(zoom / z).add(firstPos);
      dispatch(setCam({x: pos.x, y: pos.y, z: zoom}));
    },
    onCancel: () => dispatch(setCam({x, y, z}))
  };

}

export function deltaPanModZoom(pos, delta, dispatch, getState) {
  // TODO: handle when mod key is pressed
  var { x, y, z } = getState().viewport;
  let newPos = delta.mulS(z).add({x, y})
  dispatch(setCam({
    x: newPos.x,
    y: newPos.y,
    z
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
// TODO: enforce minimum line length
const MIN_LINE_LENGTH = 3;
var tempID = 0;
export function line(stream, dispatch, getState) {
  var p1, prevLine = null;
  let id = tempID++; // make addLine responsible for getting actual ID!
  let {modKeys: {alt}} = getState()
  stream.first().subscribe( pos => {
    // TODO: make function to convert to absolute coordinates
    if (alt) {
      p1 = getAbsPos(pos, getState)
    } else {
      p1 = getSnappedPos(pos, getState)
    }
  });
  let {modKeys: {shift}} = getState()

  return {
    stream: stream.map((pos) => getAbsPos(pos, getState))
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
      if (prevLine) {
        dispatch(replaceLine(prevLine, lineData))
      } else {
        dispatch(addLine(lineData))
      }
      prevLine = lineData
    },
    onCancel: () => {
      if (prevLine) {
        dispatch(removeLine(prevLine))
      }
    }
  }
}
export function pencil(stream, dispatch, getState) {
  var p0, addedLines = [];
  stream.first().subscribe( pos => {
    // TODO: make function to convert to absolute coordinates
    p0 = getAbsPos(pos, getState);
  });
  return {
    stream: stream.map((pos) => getAbsPos(pos, getState))
      .scan(([prevLine, p1], p2) => {
        if (p1.distance(p2) >= MIN_LINE_LENGTH) {
          return [[p1, p2], p2]
        }
        return [null, p1]
      }, [null, p0])
      .map(([prevLine, p1]) => prevLine)
      .filter(prevLine => prevLine !== null)
    ,
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
    onCancel: () => {
      dispatch(removeLine(addedLines))
    }
  }
}

const ERASER_RADIUS = 2;
export function eraser(stream, dispatch, getState) {
  var removedLines = [];
  return {
    stream: stream.map((pos) => getAbsPos(pos, getState)),
    onNext: (pos) => {
      let linesToRemove = getState().trackData.track.getLinesInRadius(pos.x, pos.y, ERASER_RADIUS)
      removedLines.push(linesToRemove);
      dispatch(removeLine(linesToRemove));
    },
    onCancel: () => {
      dispatch(addLine(removedLines))
    }
  }
}
