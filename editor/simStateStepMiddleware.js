import {playback} from './reducers'
import {INC_FRAME_INDEX, DEC_FRAME_INDEX, SET_FRAME_INDEX, ADD_LINE, REPLACE_LINE, REMOVE_LINE, ADD_BALL } from './actions'
import {step, addBall, addWire, removeEntity} from 'core'

function refreshSimState(simStates, getState, action) {
  let {index} = playback(getState().playback, action)
  let length = simStates.length
  for (let i = length - 1; i < index; i++) {
    simStates = simStates.concat([step(simStates[i])])
  }
  return {...action, simStates}
}

export default function simStateStep() {
  return ({getState}) => next => action => {
    let {simStatesData: {simStates, nextID}} = getState()
    switch (action.type) {
      case ADD_LINE:
        simStates = [addWire(simStates[0], action.line.id, action.line.p, action.line.q)]
        break
      case REPLACE_LINE:
        simStates = [addWire(removeEntity(simStates[0], action.prevLine.id), action.line.id, action.line.p, action.line.q)]
        break
      case REMOVE_LINE:
        break
      case ADD_BALL:
        simStates = [addBall(simStates[0], nextID, action.point, action.vel)]
        break
    }
    switch (action.type) {
      case ADD_LINE:
      case REPLACE_LINE:
      case REMOVE_LINE:
      case ADD_BALL:
      case INC_FRAME_INDEX:
      case DEC_FRAME_INDEX:
      case SET_FRAME_INDEX:
        action = refreshSimState(simStates, getState, action)
        break
    }
    let result = next(action)
    return result
  }
}
