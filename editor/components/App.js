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
import { StartFlagRaw as StartFlag, FlagRaw as Flag } from './SvgIcons'

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
    let {w: prevWidth, h: prevHeight} = this.props.widthHeight;
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
      fileLoader,
      timeline,
      editor,
      trackSaver,
      display
    } = this.props

    return (
      <div
        className='main'
        ref={component => this.container = React.findDOMNode(component)}
        onContextMenu={e => BLOCK_CONTEXT_MENU ? e.preventDefault() : null}
      >
        <Display
          {...display}
          {...{display}}
          startIcon={<StartFlag color='#ccc' />}
          flagIcon={<Flag color='#ccc' />}
          endIcon={null}
        />
        <Editor {...editor} {...{editor, fileLoader, trackSaver, timeline}} combokeys={this.combokeys} dispatch={dispatch} />
      </div>
    );
  }
});

module.exports = connect(select)(App);
