// import { Track, OldTrack } from 'core'
// import {
//   NEW_TRACK,
//   LOAD_TRACK,
//   ADD_LINE,
//   REMOVE_LINE,
//   REPLACE_LINE
// } from './actions'
// since selectors are currently singleton
// so shall the track cache
// TODO: don't make this the case
// let track = new Track([])

// function updateTrackIfNecessary(lineStore, startPosition) {
//   let updated = false
//   if (lineStore && track.lineStore !== lineStore) {
//     console.warn('force updated track lines')
//     track.updateLines(lineStore)
//     updated = true
//   }
//   let {x, y} = track.getStartPosition()
//   if (startPosition && (x !== startPosition.x || y !== startPosition.y)) {
//     console.warn('force updated track start position')
//     track.setStartPosition(startPosition)
//     updated = true
//   }
//   if (updated && !__DEVTOOLS__) {  // eslint-disable-line no-undef
//     // TODO: throw an error?
//     console.error('Track should not have been force updated in production')
//   }
// }

// function makeVersionedTrack(version, ...args) {
//   return new (version === '6.1' ? OldTrack : Track)(...args)
// }
// function getMaxLineID(lines) {
//   return lines.reduce((id, line) => Math.max(id, line.id), 0)
// }
export function trackCache() {
  return ({getState}) => next => action => {

    // switch (action.type) {
    //   case NEW_TRACK:
    //   case LOAD_TRACK:
    //     track = makeVersionedTrack(action.version, action.lines || [], action.startPosition)
    //     action = {...action,
    //       startPosition: track.getStartPosition(),
    //       lineStore: track.lineStore,
    //       maxLineID: getMaxLineID(track.getLines())
    //     }
    //     break
    //   case ADD_LINE:
    //   case REMOVE_LINE:
    //   case REPLACE_LINE:
    //     let {line, prevLine} = action
    //     let {trackData: {maxLineID}} = getState()
    //     switch (action.type) {
    //       case REMOVE_LINE:
    //         prevLine = line
    //         /* falls through */
    //       case REPLACE_LINE:
    //         if (prevLine instanceof Array) {
    //           prevLine.forEach(l => track.removeLine(l));
    //         } else {
    //           track.removeLine(prevLine)
    //         }
    //     }
    //     switch (action.type) {
    //       case ADD_LINE:
    //       case REPLACE_LINE:
    //         let lineID
    //         if (line instanceof Array) {
    //           line.forEach(l => track.addLine(l));
    //           lineID = getMaxLineID(line)
    //         } else {
    //           track.addLine(line)
    //           lineID = line.id
    //         }
    //         maxLineID = Math.max(maxLineID, lineID)
    //     }
    //     action = {...action,
    //       maxLineID,
    //       lineStore: track.lineStore
    //     }
    // }
    let result = next(action)
    // let {trackData: {lineStore, startPosition}} = getState()
    // updateTrackIfNecessary(lineStore, startPosition)
    return result
  }
}

export function getTrackFromCache(getState, lineStore, startPosition) {
  // if (getState) {
  //   ({trackData: {lineStore, startPosition}} = getState())
  // }
  // // unfortunately the middleware is unaware when the store gets switch out
  // // so need to update here
  // updateTrackIfNecessary(lineStore, startPosition)
  // return track
  throw new Error('removing getTrackFromCache')
}
