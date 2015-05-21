'use strict';

var savedLinesReader = require('../saved-lines-reader');
var React = require('react');
var Display = require('./Display');
require('buffer');

var App = React.createClass({

  getInitialState() {
    return {
      tracks: [],
      track: null,
      selected: '',
      color: false
    };
  },

  onSelectTrack(e) {
    this.setState({
      track: this.state.tracks[e.target.value],
      selected: e.target.value
    });
  },

  onToggleColor() {
    this.setState({color: !this.state.color});
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
          Toggle color: <input type="checkbox" onChange={this.onToggleColor} />
        </p>
        {
          this.state.track ?
            <Display track={this.state.track} color={this.state.color} />
            : null
        }
      </div>
    );
  }

});

module.exports = App;
