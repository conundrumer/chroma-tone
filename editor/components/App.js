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

function getWindowDimensions() {
  return {
    width: window.innerWidth || 1, // sometimes it's zero????
    height: window.innerHeight || 1 // sometimes it's zero????
  };
}

var App = React.createClass({

  getInitialState() {
    let initState = getWindowDimensions();
    return initState;
  },

  componentDidMount() {
    this.time = null;
    window.addEventListener('resize', this.onResize);
    this.onResize(true);
  },

  onResize(force) {
    if (window.innerWidth === 0) {
      console.log('innerWidth is zero, getting it again')
      setTimeout(() => this.onResize(force), 0);
      return;
    }
    if (this.state.width !== window.innerWidth || force) {
      this.setState(getWindowDimensions());
    }
  },

  render() {
    return (
      <div className='main'>
        <Display
          startPosition={randomTrack.startPosition}
          viewOptions={{ color: true, floor: true }}
          rider={randomTrack.getRiderStateAtFrame(0)}
          cam={{x: 0, y: 0, z: 1}}
          lines={randomTrack.lines}
          width={this.state.width}
          height={this.state.height}
        />
        <Editor />
      </div>
    );
  }
});
React.render(<App />, document.getElementById('content'));

module.exports = App;
