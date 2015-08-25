'use strict';

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
    // TODO: make function to convert to absolute coordinates
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

// TODO: put ID management in reducer
// TODO: enforce minimum line length
const MIN_LINE_LENGTH = 3;
var tempID = 0;
export function line(stream, dispatch, getState) {
  var p1, prevLine = null;
  let id = tempID++; // make addLine responsible for getting actual ID!
  stream.first().subscribe( pos => {
    // TODO: make function to convert to absolute coordinates
    p1 = getAbsPos(pos, getState);
  });

  return {
    stream: stream.map((pos) => getAbsPos(pos, getState))
      .filter(p2 => p1.distance(p2) >= MIN_LINE_LENGTH),
    onNext: (p2) => {
      let {toolbars: {colorSelected: lineType}, modKeys: {shift}} = getState()
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

const ERASER_RADIUS = 5;
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
