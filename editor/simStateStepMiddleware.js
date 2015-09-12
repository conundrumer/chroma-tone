import {playback} from './reducers'
import {INC_FRAME_INDEX, DEC_FRAME_INDEX, SET_FRAME_INDEX} from './actions'
import {step} from 'core'

export default function simStateStep() {
  return ({getState}) => next => action => {
    switch (action.type) {
      case INC_FRAME_INDEX:
      case DEC_FRAME_INDEX:
      case SET_FRAME_INDEX:
        let {index} = playback(getState().playback, action)
        let {simStates} = getState()
        let length = simStates.length
        for (let i = length - 1; i < index; i++) {
          simStates = simStates.concat([step(simStates[i])])
        }
        action = {...action, simStates}
    }
    let result = next(action)
    return result
  }
}
