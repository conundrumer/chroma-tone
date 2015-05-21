'use strict';

var savedLinesReader = require('../saved-lines-reader');
var React = require('react');
require('buffer');

var App = React.createClass({

  getInitialState() {
    return {
      tracks: [],
      track: null
    };
  },

  onSelect(e) {
    this.setState({
      track: this.state.tracks[e.target.value]
    })
  },

  handleFile(e) {
    var reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = (upload) => {
      this.setState({
        tracks: savedLinesReader(new Buffer(new Uint8Array(upload.target.result))),
      });
    }

    reader.readAsArrayBuffer(file);
  },

  render() {
    return (
      <div>
        Input a .sol file to view your tracks.
        <input type="file" onChange={this.handleFile} />
        {
          this.state.tracks.length > 0 ?
            <select defaultValue="" onChange={this.onSelect}>
              <option key="-1" value="" disabled>Select a track to render...</option>
              {
                this.state.tracks.map((track, i) =>
                  <option key={i} value={i}>{track.label}</option>
                )
              }
            </select>
            : null
        }
        {
          this.state.track ?
            <div>
              { JSON.stringify(this.state.track) }
            </div>
            : null
        }
      </div>
    );
  }

});

module.exports = App;
