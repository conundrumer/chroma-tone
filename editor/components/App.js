'use strict';

var React = require('react');
var { connect } = require('react-redux');

var { Display } = require('renderer');
var { Track } = require('core');

var Editor = require('./Editor');

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


var App = React.createClass({
  render() {
    let {
      dispatch,
      windowSize: {
        width,
        height
      },
      toolbars
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
        <Editor dispatch={dispatch} {...toolbars}/>
      </div>
    );
  }
});

function select({toolbars: {toggled, tool, ...toolbars}, ...state}) {
  return {...state,
    toolbars: {...toolbars,
      selected: {
        ...toggled,
        [tool]: true
      }
    }
  };
}

module.exports = connect(select)(App);
