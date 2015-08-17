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

    let track = this.props.trackData.track;
    let numLoadingFrames = 60;
    let numLinesPerFrame = Math.ceil(randomTrack.length / numLoadingFrames);
    let dispatch = this.props.dispatch;
    (function delayAddLine(n) {
      if (n >= randomTrack.length) {

        randomTrack = _.shuffle(track.getLines());

        (function delayRemoveLine(n) {
          if (n >= randomTrack.length / 2) {
            return
          }
          dispatch(removeLine(_.slice(randomTrack, n, n + numLinesPerFrame)))
          requestAnimationFrame(() => delayRemoveLine(n + numLinesPerFrame))
        })(0)

        return
      }
      dispatch(addLine(_.slice(randomTrack, n, n + numLinesPerFrame)))
      requestAnimationFrame(() => delayAddLine(n + numLinesPerFrame))
    })(0)
  },

  componentWillUnmount() {
    clearInterval(this.interval);
  },

  onResize() {
    let {
      width: prevWidth,
      height: prevHeight
    } = this.props.windowSize;
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
      windowSize: {
        width,
        height
      },
      toolbars,
      cam,
      playback,
      playing,
      trackData: {
        track,
      },
      fileLoader
    } = this.props;

    // let maxRadius = Math.max(cam.z * (Math.min(width, height) / 2) - 15);
    // let {x, y} = getRiderCam(randomTrack, playback.index, maxRadius);

    return (
      <div
        className='main'
        ref={component => this.container = React.findDOMNode(component)}
        onContextMenu={e => BLOCK_CONTEXT_MENU ? e.preventDefault() : null}
      >
        <Display
          frame={playback.index}
          startPosition={track.getStartPosition()}
          viewOptions={{ color: !playing, floor: true }}
          rider={track.getRiderStateAtFrame(playback.index)}
          cam={cam}
          lines={track.getLines()}
          width={width}
          height={height}
        />
        <Editor dispatch={dispatch} {...toolbars} fileLoader={fileLoader} playing={playing}/>
      </div>
    );
  }
});

function select({
  toolbars: {tool, ...toolbars},
  toggled,
  editorCamera,
  playback,
  ...state
}) {
  return {...state,
    toolbars: {...toolbars,
      selected: {
        ...toggled,
        [tool]: true,
        [playback.state]: playback.state !== 'stop'
      }
    },
    playing: playback.state !== 'stop' && playback.state !== 'pause',
    playback,
    cam: editorCamera,
  };
}

module.exports = connect(select)(App);
