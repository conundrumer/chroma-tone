import {playback} from './reducers'
import {INC_FRAME_INDEX, DEC_FRAME_INDEX, SET_FRAME_INDEX, ADD_LINE, REPLACE_LINE, REMOVE_LINE, ADD_BALL, REMOVE_BALL, REPLACE_BALL} from './actions'
import {step, addBall, addWire, removeEntity} from 'core'
import neume from 'neume.js'

// http://mohayonao.github.io/neume.js/examples/mml-piano.html
function piano($, freq, dur, vol, brightness = 1) {
  return $([ 1, 5, 13, 0.5 ].map(function(x, i) {
    return $("sin", { freq: freq * x });
  })).mul(0.75 * vol)
  .$("shaper", { curve: 0.75 })
  .$("lpf", { freq: $("line", { start: brightness * freq * 3, end: brightness * freq * 0.75, dur: brightness * 3.5 }), Q: 6 })
  .$("xline", { start: 0.5, end: 0.01, dur: dur * 5 }).on("end", $.stop);
}
var CONTEXT = new window.AudioContext()

let neu = neume(CONTEXT)

// http://en.wikipedia.org/wiki/MIDI_Tuning_Standard#Frequency_values
function freqToStep(hz) {
  return 69 + 12 * Math.log2(hz / 440);
}
function stepToFreq(step) {
  return 440 * Math.pow(2, (step - 69) / 12);
}

function makeCollisionSounds(collisions) {
  collisions.forEach(({entities: [_, wire], force}) => {
    if (force < 0.2) return // more than gravity
    let length = wire.p.distance(wire.q)
    neu.Synth(($) => piano($, 440 * 128 / length, Math.sqrt(force) / 10, wire.t * (1 - Math.exp(-force))), wire.t).start('now')
  })
}

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
    let {simStatesData: {simStates}} = getState()
    let balls
    let lines
    switch (action.type) {
      case REPLACE_LINE:
        simStates = [addWire(removeEntity(simStates[0], action.prevLine.id), action.line.id, action.line.p, action.line.q, action.line.t)]
        break
      case REPLACE_BALL:
        simStates = [addBall(removeEntity(simStates[0], action.prevBall.id), action.ball.id, action.ball.p, action.ball.v)]
        break
      case REMOVE_LINE:
        if (action.line instanceof Array) {
          lines = action.line
        } else {
          lines = [action.line]
        }
        lines.forEach(line => {
          simStates = [removeEntity(simStates[0], line.id)]
        })
        break
      case REMOVE_BALL:
        if (action.ball instanceof Array) {
          balls = action.ball
        } else {
          balls = [action.ball]
        }
        balls.forEach(ball => {
          simStates = [removeEntity(simStates[0], ball.id)]
        })
        break
      case ADD_LINE:
        if (action.line instanceof Array) {
          lines = action.line
        } else {
          lines = [action.line]
        }
        lines.forEach(line => {
          simStates = [addWire(simStates[0], line.id, line.p, line.q, line.t)]
        })
        break
      case ADD_BALL:
        if (action.ball instanceof Array) {
          balls = action.ball
        } else {
          balls = [action.ball]
        }
        balls.forEach(ball => {
          simStates = [addBall(simStates[0], ball.id, ball.p, ball.v)]
        })
        break
    }
    switch (action.type) {
      case SET_FRAME_INDEX:
        action = refreshSimState(simStates, getState, action)
        break
      case ADD_LINE:
      case REPLACE_LINE:
      case REMOVE_LINE:
      case ADD_BALL:
      case REMOVE_BALL:
      case REPLACE_BALL:
      case INC_FRAME_INDEX:
      case DEC_FRAME_INDEX:
        action = refreshSimState(simStates, getState, action)
        let {index} = playback(getState().playback, action)
        makeCollisionSounds(action.simStates[index].collisions)
    }
    let result = next(action)
    return result
  }
}
