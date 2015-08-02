'use strict';

var { solReader } = require('../../io');
var React = require('react');
var Display = require('../Display');
var getBoundingBox = require('../getBoundingBox');
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
      playing: false,
      frame: 0,
      maxFrame: 0,
      grid: false,
      slowmo: false,
      floor: false,
      accArrow: false,
      snapDot: false,
      color: false,
      boundingBox: [0, 0, 200, 200],
      initPanx: 100,
      initPany: 100,
      initZoom: 2,
      panx: 0,
      pany: 0,
      zoom: 1,
      framesSkipped: 0,
      width: window.innerWidth || 1 // sometimes it's zero????
    };
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
      this.setState({
        width: window.innerWidth || 1
      });
      this.setInitCamera();
    }
  },

  onSelectTrack(e) {
    let trackData = this.state.tracks[e.target.value];
    let startPos = { x: trackData.startPosition[0], y: trackData.startPosition[1] };
    let version = trackData.version;
    let VersionedTrack = Track;
    if (version === '6.1') {
      VersionedTrack = OldTrack;
    }
    let track = new VersionedTrack(trackData.lines, startPos, DEBUG);
    track.label = trackData.label;
    let box = getBoundingBox(track.lines.concat([{
      x1: startPos.x - 10,
      y1: startPos.y - 10,
      x2: startPos.x + 10,
      y2: startPos.y + 10
    }]));
    this.setState({
      track: track,
      selected: e.target.value,
      boundingBox: box,
      panx: 0,
      pany: 0,
      zoom: 1
    });
    this.stopPlayback();
    this.setState({ maxFrame: 0 });
    this.setInitCamera(box);
  },

  setInitCamera(box = this.state.boundingBox) {
    let [x1, y1, x2, y2] = box;
    [x1, y1, x2, y2] = [x1 - 10, y1 - 10, x2 + 10, y2 + 10];
    let [w, h] = [x2 - x1, y2 - y1];
    let [cx, cy] = [x1 + w / 2, y1 + h / 2];
    this.setState({
      initPanx: cx,
      initPany: cy,
      initZoom: w / this.state.width
    });
  },

  onTogglePlayback() {
    if (!this.state.playing) {
      this.setState({ playing: true, framesSkipped: 0 });
      this.prevTime = Date.now();
      var step = () => {
        let fps = this.getFPS();
        let framesElapsed = Math.floor((Date.now() - this.prevTime) / 1000 * fps);
        this.timer = requestAnimationFrame(step);

        if (framesElapsed > 0) {
          this.prevTime += framesElapsed / fps * 1000;
          let nextFrame = this.state.frame + framesElapsed;
          if (this.state.doNotSkipFrames) {
            framesElapsed = 1;
          }
          this.setState({
            frame: nextFrame,
            maxFrame: Math.max(this.state.maxFrame, nextFrame),
            framesSkipped: this.state.framesSkipped + framesElapsed - 1
          });
        }
      };

      step();

    } else {
      this.stopPlayback();
    }
  },

  stopPlayback() {
    cancelAnimationFrame(this.timer);
    this.setState({ playing: false, frame: 0 });
  },

  onPause() {
    cancelAnimationFrame(this.timer);
    this.setState({ playing: false });
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
    let [x1, y1, x2, y2] = this.state.boundingBox;
    let [w, h] = [x2 - x1, y2 - y1];
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
        <p>{this.state.frame} {this.state.framesSkipped}</p>
        {
          this.state.track ?
            <div>
              <div>
                pan x: <input type='range' min={-w} max={w} value={this.state.panx} onChange={e => this.setState({panx: Number(e.target.value)})}/>
              </div>
              <div>
                pan y: <input type='range' min={-h} max={h} value={this.state.pany} onChange={e => this.setState({pany: Number(e.target.value)})}/>
              </div>
              <div>
                zoom: <input type='range' min={-3} max={1} value={Math.log2(this.state.zoom)} onChange={e => this.setState({zoom: Math.pow(2, Number(e.target.value))})} step={1 / 144}/>
              </div>
              <div>
                frame: <input type='range' min={0} max={this.state.maxFrame} value={this.state.frame} onChange={e => this.setState({frame: parseInt(e.target.value)})}/>
              </div>
              { this.renderToggle('slowmo') }
              <button onClick={() => {console.log(this.state.track.lines)}}>Print lines</button>
              <button onClick={this.onTogglePlayback}>{ this.state.playing ? 'Stop' : 'Play'}</button>
              <button onClick={this.onPause}>Pause</button>
              <button onClick={() => this.setState({ frame: this.state.frame + 1 })}>Step forward</button>
              <button onClick={() => this.setState({ frame: Math.max(0, this.state.frame - 1) })}>Step backward</button>
            </div>
            : null
        }
        {
          this.state.track ?
            <Display
              {...this.state}
              label={this.state.tracks[this.state.selected] ? (this.state.tracks[this.state.selected].label + this.state.selected) : null}
              rider={this.getRider()}
              pan={{
                x: this.state.initPanx + this.state.panx,
                y: this.state.initPany + this.state.pany
              }}
              zoom={this.state.initZoom * this.state.zoom}
              lines={this.state.track.lines}
              width={this.state.width}
              height={Math.round(h / w * this.state.width)} />
            : null
        }
      </div>
    );
  }

});

module.exports = App;
