'use strict';

import { setCam } from './actions';

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
    // to absolute coordinates
    firstPos = pos.clone().subtract({x: w/2, y: h/2}).mulS(z).add({x, y});
  });
  return {
    stream: stream.map((pos) => {
      let dz = Math.pow(ZOOM.STRENGTH, y0 - pos.y);
      return Math.min(Math.max(z / dz, ZOOM.MIN), ZOOM.MAX);
    }),
    onNext: (zoom) => {
      // startPos + (initPan - startPos) * initZoom / zoom
      let pos = firstPos.clone().mulS(-1).add({x, y}).mulS(zoom / z).add(firstPos);
      dispatch(setCam({x: pos.x, y: pos.y, z: zoom}));
    },
    onCancel: () => dispatch(setCam({x, y, z}))
  };

}
