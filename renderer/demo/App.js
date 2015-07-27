'use strict';

var { solReader } = require('../../io');
var React = require('react');
var Display = require('../Display');
require('buffer');

var { Track, OldTrack } = require('../../core');

var DEBUG = false;

var defaultLines = [
  {
    x1: 15,
    y1: 180,
    x2: 190,
    y2: 190,
    extended: 0,
    flipped: false,
    leftLine: null,
    rightLine: null,
    id: 0,
    type: 0
  }
];
var App = React.createClass({

  getInitialState() {
    return {
      tracks: [],
      track: new Track(defaultLines, {x: 0, y: 0}, DEBUG),
      selected: '',
      timer: false,
      frame: 0,
      grid: false,
      slowmo: false,
      floor: false,
      accArrow: false,
      snapDot: false,
      color: false
    };
  },

  onSelectTrack(e) {
    let trackData = this.state.tracks[e.target.value];
    let startPos = trackData.startPosition;
    let version = trackData.version;
    let VersionedTrack = Track;
    if (version === '6.1') {
      VersionedTrack = OldTrack;
    }
    let track = new VersionedTrack(trackData.lines, { x: startPos[0], y: startPos[1] }, DEBUG);
    track.label = trackData.label;
    this.setState({
      track: track,
      selected: e.target.value
    });
    this.stopPlayback();
  },

  onTogglePlayback() {
    if (!this.state.timer) {
      var step = () => {
        let timer = setTimeout(step, 1000 / this.getFPS());
        this.setState({ frame: this.state.frame + 1, timer: timer });
      };

      step();

    } else {
      this.stopPlayback();
    }
  },

  stopPlayback() {
    clearTimeout(this.state.timer);
    this.setState({ frame: 0, timer: null });
  },

  onPause() {
    clearTimeout(this.state.timer);
    this.setState({ timer: null });
  },

  onToggle(key) {
    return () => {
      let nextState = {};
      nextState[key] = !this.state[key];
      this.setState(nextState);
    };
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
          tracks: solReader(new Buffer(new Uint8Array(upload.target.result))),
          track: null,
          selected: ''
        });
        this.stopPlayback();
      } catch (e) {
        alert(`There is something wrong with this .sol!\n${e}`);
      }
    };

    reader.readAsArrayBuffer(file);
  },

  getRider() {
    return this.state.track.getRiderAtFrame(this.state.frame);
  },

  getFPS() {
    let fps = 40;
    return this.state.slowmo ? fps / 8 : fps;
  },

  renderToggle(key) {
    if (this.state[key] === undefined) {
      throw new Error('Key does not exist in state, cannot toggle: ', key);
    }
    return (
      <p key={key}>
        {key}: <input type="checkbox" checked={this.state[key]} onChange={this.onToggle(key)} />
      </p>
    );
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
        {
          this.state.selected ?
          <p>
            <b>Track name:</b> { this.state.tracks[this.state.selected].label } <br/>
            <b>Version:</b> { this.state.tracks[this.state.selected].version } <br/>
            <b>Line count:</b> { this.state.track.lines.length }
          </p>
          : null
        }
        { ['grid', 'color'].map(this.renderToggle) }
        {
          this.state.color ?
            ['floor', 'accArrow', 'snapDot'].map(this.renderToggle)
          : null
        }
        <p>{this.state.frame}</p>
        {
          this.state.track ?
            <div>
              { this.renderToggle('slowmo') }
              <button onClick={() => {console.log(this.state.track.lines)}}>Print lines</button>
              <button onClick={this.onTogglePlayback}>{ this.state.timer ? 'Stop' : 'Play'}</button>
              <button onClick={this.onPause}>Pause</button>
              <button onClick={() => this.setState({ frame: this.state.frame + 1 })}>Step forward</button>
              <button onClick={() => this.setState({ frame: Math.max(0, this.state.frame - 1) })}>Step backward</button>
            </div>
            : null
        }
        {
          this.state.track ?
            <Display {...this.state} rider={this.getRider()} />
            : null
        }
      </div>
    );
  }

});

module.exports = App;
