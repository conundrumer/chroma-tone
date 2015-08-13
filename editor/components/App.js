'use strict';

var React = require('react');
var { connect } = require('react-redux');
var Combokeys = require('combokeys');
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

function setDefaultHotkeys(dispatch, combokeys, ripples) {
  _.forEach(getButtons(), ({hotkey}, name) => {
    dispatch(setHotkey(combokeys, ripples, name, hotkey));
  });
}

var App = React.createClass({

  componentWillMount() {
    this.ripples = Object.create(null);
  },

  setRipple(name, start, end) {
    let ripple = this.ripples[name];
    if (!ripple) {
      ripple = [];
    }
    ripple.push({start, end})

    this.ripples[name] = ripple;
  },

  componentDidMount() {
    this.interval = setInterval(this.onResize, 100);

    // add ripples to indicate hotkey has occured in hidden toolbars
    let buttons = getButtons();
    let bs = getButtonGroups(buttons);
    let float = _.flatten(_.values(bs.float));
    _.forEach(buttons, b => {
      if (!_.contains(float, b)) {
        this.ripples[b.name].push(this.ripples.showToolbars[0]);
      }
    });

    this.combokeys = new Combokeys(document);
    setDefaultHotkeys(this.props.dispatch, this.combokeys, this.ripples);
  },

  componentWillUnmount() {
    clearInterval(this.interval);

    this.combokeys.detach();
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
        <Editor dispatch={dispatch} {...toolbars} setRipple={this.setRipple}/>
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
