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
var Display = require('renderer/Display');
var { Track } = require('../../core');

function randomLines() {
  var lines = [];
  var limits = 900;
  var getNum = () => (Math.random() - 0.5) * limits;
  var getLineType = () => Math.floor(3 * Math.random());
  for (let i = 0; i < 40; i++) {
    lines.push({
      x1: 2 * getNum(),
      y1: getNum(),
      x2: 2 * getNum(),
      y2: getNum(),
      extended: 0,
      flipped: false,
      leftLine: null,
      rightLine: null,
      id: 0,
      type: getLineType()
    });
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
          viewOptions={{}}
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
