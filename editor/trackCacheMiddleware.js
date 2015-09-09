import {
  NEW_TRACK,
  LOAD_TRACK,
  ADD_LINE,
  REMOVE_LINE,
  REPLACE_LINE
} from './actions'
// since selectors are currently singleton
// so shall the track cache
// TODO: don't make this the case
import { newTrack } from './actions';
let track = newTrack().track

function getMaxLineID(lines) {
  return lines.reduce((id, line) => Math.max(id, line.id), 0)
}
export function trackCache() {
  return ({getState}) => next => action => {

    switch (action.type) {
      // TODO: handle creating new tracks here instead of actions.js>newTrack)()/loadTrack()
      case NEW_TRACK:
      case LOAD_TRACK:
        track = action.track
        break
      case ADD_LINE:
      case REMOVE_LINE:
      case REPLACE_LINE:
        let {line, prevLine} = action
        let {trackData: {maxLineID}} = getState()
        switch (action.type) {
          case REMOVE_LINE:
            prevLine = line
            /* falls through */
          case REPLACE_LINE:
            if (prevLine instanceof Array) {
              prevLine.forEach(l => track.removeLine(l));
            } else {
              track.removeLine(prevLine)
            }
        }
        switch (action.type) {
          case ADD_LINE:
          case REPLACE_LINE:
            let lineID
            if (line instanceof Array) {
              line.forEach(l => track.addLine(l));
              lineID = getMaxLineID(line)
            } else {
              track.addLine(line)
              lineID = line.id
            }
            maxLineID = Math.max(maxLineID, lineID)
        }
        action = {...action,
          maxLineID,
          lineStore: track.lineStore
        }

    }
    let result = next(action)
    let {trackData: {lineStore, startPosition}} = getState()
    let {x, y} = track.getStartPosition()
    if (track.lineStore !== lineStore || x !== startPosition.x || y !== startPosition.y) {
      console.error('track cache out of date in middleware')
    }
    return result
  }
}

export function getTrackFromCache(getState, lineStore, startPosition) {
  if (getState) {
    ({trackData: {lineStore, startPosition}} = getState())
  }
  // unfortunately the middleware is unaware when the store gets switch out
  // so need to update here
  if (track.lineStore !== lineStore) {
    console.warn('track cache out of date, do the diff thing and update it')
  }
  let {x, y} = track.getStartPosition()
  if (x !== startPosition.x || y !== startPosition.y) {
    track.setStartPosition(startPosition)
  }
  return track
}
