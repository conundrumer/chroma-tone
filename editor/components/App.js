'use strict';

var React = require('react');
var { connect } = require('react-redux');
var _ = require('lodash');

var { Display } = require('renderer');
var { Track } = require('core');

var { setWindowSize, setHotkey } = require('../actions');
var Editor = require('./Editor');
var { getButtons, getButtonGroups } = require('../buttons');


var makeRandomLine = require('../../test/makeRandomLine');

function randomLines() {
  var lines = [];
  var limits = 900;
  var numLines = 1000;

  for (let i = 0; i < numLines; i++) {
    lines.push(makeRandomLine(limits, 2));
  }
  return lines;
}

var DEBUG = false;
var randomTrack = new Track(randomLines(), {x: 0, y: 0}, DEBUG);

var BLOCK_CONTEXT_MENU = true;

var App = React.createClass({

  componentDidMount() {
    this.interval = setInterval(this.onResize, 100);
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
      cam
    } = this.props;
    return (
      <div
        className='main'
        ref={component => this.container = React.findDOMNode(component)}
        onContextMenu={e => BLOCK_CONTEXT_MENU ? e.preventDefault() : null}
      >
        <Display
          startPosition={randomTrack.startPosition}
          viewOptions={{ color: true, floor: true }}
          rider={randomTrack.getRiderStateAtFrame(0)}
          cam={cam}
          lines={randomTrack.lines}
          width={width}
          height={height}
        />
        <Editor dispatch={dispatch} {...toolbars} />
      </div>
    );
  }
});

function select({toolbars: {toggled, tool, ...toolbars}, editorCamera, ...state}) {
  return {...state,
    toolbars: {...toolbars,
      selected: {
        ...toggled,
        [tool]: true
      }
    },
    cam: editorCamera
  };
}

module.exports = connect(select)(App);
