'use strict';

import { setCam, addLine, removeLine } from './actions';

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
  var { x, y, z } = getState().editorCamera;
  return {
    stream: stream.map((pos) =>
      firstPos.clone().subtract(pos).mulS(z).add({x, y})
    ),
    onNext: (trackPos) => dispatch(setCam({x: trackPos.x, y: trackPos.y, z})),
    onCancel: () => dispatch(setCam({x, y, z}))
  };

}

function getAbsPos(relPos, getState) {
  var { editorCamera: {x, y, z}, windowSize: {width: w, height: h} } = getState();
  return relPos.clone().subtract({x: w/2, y: h/2}).mulS(z).add({x, y});
}

const ZOOM = {
  STRENGTH: Math.pow(2, 1/(2<<5)),
  MAX: 2<<4,
  MIN: 1/(2<<4)
};
export function zoom(stream, dispatch, getState) {
  var firstPos, y0;
  var { editorCamera: {x, y, z}, windowSize: {width: w, height: h} } = getState();
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
var tempID = 0;
var tempLineType = 0;
export function line(stream, dispatch, getState) {
  var p1, prevLine = null;
  let id = tempID++; // make addLine responsible for getting actual ID!
  stream.first().subscribe( pos => {
    // TODO: make function to convert to absolute coordinates
    p1 = getAbsPos(pos, getState);
  });

  return {
    stream: stream.map((pos) => getAbsPos(pos, getState)),
    onNext: (p2) => {
      if (prevLine) {
        dispatch(removeLine(prevLine))
      }
      let lineData = {
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        id: id,
        type: tempLineType
      }
      dispatch(addLine(lineData))
      prevLine = lineData
    },
    onCancel: () => {
      if (prevLine) {
        dispatch(removeLine(prevLine))
      }
    }
  }
}
