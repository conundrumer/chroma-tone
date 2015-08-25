'use strict';

var React = require('react');
var { connect } = require('react-redux');

import mui from 'material-ui'
let {
  Styles: {
    ThemeManager: MuiThemeManager,
    Colors: {
      blue500,
      red500,
      green500
    }
  }
} = mui

var { Display } = require('renderer');

var { setWindowSize, setModKey } = require('../actions');
var Editor = require('./Editor');

import select from '../selectors'
import Combokeys from 'combokeys'
import FlagVariant from 'icons/flag-variant'
import FlagOutlineVariant from 'icons/flag-outline-variant'

var BLOCK_CONTEXT_MENU = true;

var ThemeManager = new MuiThemeManager();
function setTheme() {
  let palette = ThemeManager.getCurrentTheme().palette;
  palette.primary1Color = blue500;
  palette.primary2Color = red500;
  palette.primary3Color = green500;
  ThemeManager.setPalette(palette);
  ThemeManager.setComponentThemes({
    raisedButton: {
      primaryColor: red500
    },
    menuItem: {
      selectedTextColor: red500
    },
    floatingActionButton: {
      miniSize: 20
    }
  })
}

var App = React.createClass({

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  get childContextTypes() {
    return {
      muiTheme: React.PropTypes.object
    }
  },

  componentWillMount() {
    setTheme();
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
        maxIndex,
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
          maxIndex={maxIndex}
          startPosition={startPosition}
          viewOptions={{ color: !inPlaybackMode, floor: true, accArrow: true }}
          rider={state}
          flagRider={flagState}
          cam={cam}
          lines={lines}
          width={w}
          height={h}
          startIcon={<g transform='translate(-6 -21)' >
            <path fill='#ccc' d='M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3M7,7.25V11.5C7,11.5 9,10 11,10C13,10 14,12 16,12C18,12 18,11 18,11V7.5C18,7.5 17,8 16,8C14,8 13,6 11,6C9,6 7,7.25 7,7.25Z' />
          </g>}
          flagIcon={<g transform='translate(-6 -21)' >
            <path fill='#ccc' d='M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3Z' />
          </g>}
          endIcon={null}
        />
        <Editor {...editor} {...{editor, fileLoader, timeline}} combokeys={this.combokeys} dispatch={dispatch} />
      </div>
    );
  }
});

module.exports = connect(select)(App);
