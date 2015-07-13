'use strict';

var savedLinesReader = require('../saved-lines-reader');
var React = require('react');
var Display = require('./Display');
require('buffer');

var NoGridTrack = require('../track').NoGridTrack;

var App = React.createClass({

  getInitialState() {
    return {
      rider: null,
      tracks: [],
      track: null,
      selected: '',
      floor: false,
      accArrow: false,
      snapDot: false,
      color: false
    };
  },

  onSelectTrack(e) {
    let trackData = this.state.tracks[e.target.value];
    let startPos = trackData.startPosition;
    let track = new NoGridTrack(trackData.lines, { x: startPos[0], y: startPos[1] });
    track.label = trackData.label;
    this.setState({
      track: track,
      selected: e.target.value,
      rider: track.getRiderAtFrame(0)
    });
  },

  onToggleColor() {
    this.setState({color: !this.state.color});
  },

  onToggleFloor() {
    this.setState({floor: !this.state.floor});
  },

  onToggleAccArrow() {
    this.setState({accArrow: !this.state.accArrow});
  },

  onToggleSnapDot() {
    this.setState({snapDot: !this.state.snapDot});
  },

  onFileInput(e) {
    var reader = new FileReader();
    var file = e.target.files[0];
    if (!file) {
      return;
    }

    reader.onload = (upload) => {
      try {
        this.setState({
          tracks: savedLinesReader(new Buffer(new Uint8Array(upload.target.result))),
          track: null,
          selected: ''
        });
      } catch (e) {
        alert(`This is probably not a .sol! ${e}`);
      }
    };

    reader.readAsArrayBuffer(file);
  },

  render() {
    return (
      <div>
        <p>Input a .sol file to view your tracks.</p>
        <p><input type="file" onChange={this.onFileInput} /></p>
        <p>
          {
            this.state.tracks.length > 0 ?
              <select value={this.state.selected} onChange={this.onSelectTrack}>
                <option key="-1" value="" disabled>Select a track to render...</option>
                {
                  this.state.tracks.map((track, i) =>
                    <option key={i} value={i}>{track.label}</option>
                  )
                }
              </select>
              : null
          }
        </p>
        <p>
          Toggle color: <input type="checkbox" checked={this.state.color} onChange={this.onToggleColor} />
        </p>
        {
          this.state.color ?
          <div>
            <p>
              Toggle floor: <input type="checkbox" checked={this.state.floor} onChange={this.onToggleFloor} />
            </p>
            <p>
              Toggle acceleration arrow: <input type="checkbox" checked={this.state.accArrow} onChange={this.onToggleAccArrow} />
            </p>
            <p>
              Toggle snap dot: <input type="checkbox" checked={this.state.snapDot} onChange={this.onToggleSnapDot} />
            </p>
          </div> : null
        }
        {
          this.state.track ?
            <Display {...this.state} />
            : null
        }
      </div>
    );
  }

});

module.exports = App;
