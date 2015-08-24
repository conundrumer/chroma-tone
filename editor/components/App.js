'use strict';

var React = require('react');
var { connect } = require('react-redux');

var { Display } = require('renderer');

var { setWindowSize, setModKey } = require('../actions');
var Editor = require('./Editor');

import select from '../selectors'
import Combokeys from 'combokeys'

var BLOCK_CONTEXT_MENU = true;

var App = React.createClass({

  componentWillMount() {
    this.combokeys = new Combokeys(document);
    // TODO: make a system for modifier keys
    this.combokeys.bind('shift', () => this.props.dispatch(setModKey('shift', true)), 'keydown')
    this.combokeys.bind('shift', () => this.props.dispatch(setModKey('shift', false)), 'keyup')
  },

  componentDidMount() {
    this.interval = setInterval(this.onResize, 100);
  },

  componentWillUnmount() {
    clearInterval(this.interval);
    this.combokeys.detach();
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
      cam,
      playback: {
        index,
        flag,
      },
      inPlaybackMode,
      rider: {
        startPosition,
        state,
        flagState
      },
      fileLoader,
      lines,
      timeline,
      editor
    } = this.props

    return (
      <div
        className='main'
        ref={component => this.container = React.findDOMNode(component)}
        onContextMenu={e => BLOCK_CONTEXT_MENU ? e.preventDefault() : null}
      >
        <Display
          frame={index}
          flagIndex={flag}
          startPosition={startPosition}
          viewOptions={{ color: !inPlaybackMode, floor: true, accArrow: true }}
          rider={state}
          flagRider={flagState}
          cam={cam}
          lines={lines}
          width={w}
          height={h}
        />
        <Editor {...editor} {...{editor, fileLoader, timeline}} combokeys={this.combokeys} dispatch={dispatch} />
      </div>
    );
  }
});

module.exports = connect(select)(App);
