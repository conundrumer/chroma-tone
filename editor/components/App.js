'use strict';
var injectTapEventPlugin = require("react-tap-event-plugin");
//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();
require('normalize.css');

require('assets/css/fonts.css');
require('../styles/main.less');
var React = require('react');

var Editor = require('./Editor');
var { Display } = require('renderer');
var { Track } = require('core');
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

var { connect } = require('react-redux');

var App = React.createClass({
  render() {
    let {
      windowSize: {
        width,
        height
      }
    } = this.props;
    return (
      <div className='main'>
        <Display
          startPosition={randomTrack.startPosition}
          viewOptions={{ color: true, floor: true }}
          rider={randomTrack.getRiderStateAtFrame(0)}
          cam={{x: 0, y: 0, z: 1}}
          lines={randomTrack.lines}
          width={width}
          height={height}
        />
        <Editor />
      </div>
    );
  }
});

function select(state) {
  return state;
}

App = connect(select)(App);

// action types
const RESIZE = 'RESIZE';

// reducers
function windowSize(state = {width: 1, height: 1}, action) {
  switch (action.type) {
    case RESIZE:
      return action.windowSize;
    default:
      return state;
  }
}

// actions
function setWindowSize({ width, height }) {
  return {
    type: RESIZE,
    windowSize: { width, height }
  };
}

// main
var { createStore, combineReducers } = require('redux');
var { Provider } = require('react-redux');

let editorApp = combineReducers({ windowSize });
let store = createStore(editorApp);

var browser = require('browser-size')();
browser.on('resize', () => {
  store.dispatch(setWindowSize(browser));
});

let rootElement = document.getElementById('content')
React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  rootElement);

module.exports = App;
