import {playback} from './reducers'
import {INC_FRAME_INDEX, DEC_FRAME_INDEX, SET_FRAME_INDEX, SELECT_LINE, ADD_LINE, REPLACE_LINE, REMOVE_LINE, ADD_BALL, REMOVE_BALL, REPLACE_BALL} from './actions'
import {step, addBall, addWire, removeEntity} from 'core'
import neume from 'neume.js'
import _ from 'lodash'

// http://mohayonao.github.io/neume.js/examples/mml-piano.html
function piano($, freq, dur, vol, timbre) {
  let freqBrightness = Math.sqrt(freq * 500) * ((vol + 1) / 2)
  return $([ 1, 5, 13, 0.5 ].map(function(x, i) {
    return $("sin", { freq: freq * x, mul: Math.pow(x, 2 * (timbre - 1)) });
  })).mul(0.75 * vol)
  .$("shaper", { curve: 0.75 * timbre })
  .$("lpf", { freq: $("line", { start: freqBrightness * 3, end: freqBrightness * 0.75, dur: 3.5 }), Q: 6 })
  .$("xline", { start: 0.5, end: 0.01, dur: dur * 5 }).on("end", $.stop);
}
// http://en.wikipedia.org/wiki/MIDI_Tuning_Standard#Frequency_values
function freqToStep(hz) {
  return 69 + 12 * Math.log2(hz / 440);
}
function stepToFreq(step) {
  return 440 * Math.pow(2, (step - 69) / 12);
}

function wireLength(wire) {
  return wire.p.distance(wire.q)
}

function makeCollisionSounds(neu, collisions) {
  collisions.forEach(({entities: [ , wire], force}) => {
    if (wire.t === 0) return
    if (force < 0.35) return // more than gravity
    let length = wireLength(wire)
    let vol = 1 - 1 / (1 + Math.max(0, force - 0.35))
    neu.Synth(($) => piano($, 440 * 128 / length, Math.sqrt(force) / 10, vol * vol, wire.t)).start('now')
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

function getLineByID(simState, lineID) {
  let line = _.filter(simState.balls.concat(simState.wires), {id: lineID})[0]
  if (line != null) {
    if (line.q) {
      return line
    }
  }
}

function equalLength(wire1, wire2) {
  let len1 = Math.log2(wireLength(wire1))
  let len2 = Math.log2(wireLength(wire2))
  return Math.abs(len1 - len2) < 1 / 12 / 100
}

export default function simStateStep() {
  var CONTEXT = new window.AudioContext()

  // https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
  function unlockWebAudio() {

    // create empty buffer
    var buffer = CONTEXT.createBuffer(1, 1, 22050);
    var source = CONTEXT.createBufferSource();
    source.buffer = buffer;

    // connect to output (your speakers)
    source.connect(CONTEXT.destination);

    // play the file
    source.start(0);
    window.removeEventListener('touchstart', unlockWebAudio, false);
  }
  window.addEventListener('touchstart', unlockWebAudio, false);

  let neu = neume(CONTEXT)

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
    }
    let result = next(action)
    let updatedState = getState().simStatesData.simStates
    // console.log(updatedState)
    let line;
    switch (action.type) {
      case SELECT_LINE:
        line = getLineByID(updatedState[0], action.lineID)
        break
      case ADD_LINE:
        line = action.line instanceof Array ? null : action.line
        break
      case REPLACE_LINE:
        line = equalLength(action.prevLine, action.line) ? null : action.line
        break
      case INC_FRAME_INDEX:
      case DEC_FRAME_INDEX:
        makeCollisionSounds(neu, updatedState[getState().playback.index].collisions)
    }
    if (line) {
      makeCollisionSounds(neu, [{entities: [null, line], force: 1}])
    }
    return result
  }
}
