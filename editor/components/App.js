'use strict';

var React = require('react');
var { connect } = require('react-redux');

var { Display } = require('renderer');

var { setWindowSize, addLine, removeLine, newTrack } = require('../actions');
var Editor = require('./Editor');

var makeRandomLine = require('../../test/makeRandomLine');
var _ = require('lodash');

function randomLines() {
  var lines = [];
  var limits = 900;
  var numLines = 500;

  for (let i = 0; i < 2 * numLines; i++) {
    lines.push(makeRandomLine(limits, 2));
  }
  return lines;
}

var randomTrack = randomLines();

var BLOCK_CONTEXT_MENU = true;

var App = React.createClass({

  componentDidMount() {
    this.interval = setInterval(this.onResize, 100);
  },

  componentWillUnmount() {
    clearInterval(this.interval);
  },

  onResize() {
    let {w: prevWidth, h: prevHeight} = this.props.viewport;
    // let {width, height} = this.container.getBoundingClientRect();
    let {
      innerWidth: width,
      innerHeight: height
    } = window;

    if (width > 0 && height > 0 && width !== prevWidth || height !== prevHeight) {
      this.props.dispatch(setWindowSize({width, height}));
    }
  },

  render() {
    let {
      dispatch,
      viewport: {w, h},
      toolbars,
      cam,
      playback,
      playing,
      rider: {
        startPosition,
        state,
        flagState
      },
      fileLoader,
      lines,
    } = this.props;

    // let maxRadius = Math.max(cam.z * (Math.min(width, height) / 2) - 15);
    // let {x, y} = getRiderCam(randomTrack, playback.index, maxRadius);
    // move logic to selector maybe i think ???
    return (
      <div
        className='main'
        ref={component => this.container = React.findDOMNode(component)}
        onContextMenu={e => BLOCK_CONTEXT_MENU ? e.preventDefault() : null}
      >
        <Display
          frame={playback.index}
          flagIndex={playback.flag}
          startPosition={startPosition}
          viewOptions={{ color: !playing, floor: true }}
          rider={state}
          flagRider={flagState}
          cam={this.props.cam}
          lines={lines}
          width={w}
          height={h}
        />
        <Editor dispatch={dispatch} {...toolbars} fileLoader={fileLoader} playing={playing}/>
      </div>
    );
  }
});

function selectCam({w, h, x, y, z}, playing, track, index) {
  if (playing) {
    let offset = 25; // TODO: make this responsive to toolbars
    let maxRadius = Math.max(z * (Math.min(w, h) / 2) - offset)
    ;({x, y} = track.getRiderCam(index, maxRadius))
  }
  return {x, y, z}
}

function selectLines({w, h}, {x, y, z}, track) {
  let [x1, y1, width, height] = [
    x - w / 2 * z,
    y - h / 2 * z,
    w * z,
    h * z
  ]
  return track.getLinesInBox(x1, y1, x1 + width, y1 + height)
}

function selectRider({index, flag}, track) {
  return {
    startPosition: track.getStartPosition(),
    state: track.getRiderStateAtFrame(index),
    flagState: track.getRiderStateAtFrame(flag)
  }
}

function select({
  toolbars: {tool, ...toolbars},
  toggled,
  viewport,
  playback,
  trackData,
  ...state
}) {
  let playing = playback.state !== 'stop' && playback.state !== 'pause'
  let cam = selectCam(viewport, playing, trackData.track, playback.index)
  return {...state,
    toolbars: {...toolbars,
      selected: {
        ...toggled,
        [tool]: true,
        [playback.state]: playback.state !== 'stop'
      }
    },
    playing,
    playback,
    cam,
    viewport,
    lines: selectLines(viewport, cam, trackData.track),
    rider: selectRider(playback, trackData.track)
  };
}

module.exports = connect(select)(App);
