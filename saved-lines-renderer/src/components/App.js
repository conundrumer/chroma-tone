'use strict';

var savedLinesReader = require('../saved-lines-reader');
var React = require('react');
var Display = require('./Display');
require('buffer');

var Track = require('../track').Track;

var App = React.createClass({

  getInitialState() {
    return {
      tracks: [],
      track: null,
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
    let track = new Track(trackData.lines, { x: startPos[0], y: startPos[1] });
    track.label = trackData.label;
    this.setState({
      track: track,
      selected: e.target.value,
    });
  },

  onTogglePlayback() {
    if (!this.state.timer) {
      var step = () => {
        let timer = setTimeout(step, 1000 / this.getFPS());
        this.setState({ frame: this.state.frame + 1, timer: timer });
      };

      step();

    } else {
      clearTimeout(this.state.timer);
      this.setState({ frame: 0, timer: null });
    }
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
        Toggle {key}: <input type="checkbox" checked={this.state[key]} onChange={this.onToggle(key)} />
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
        { ['grid', 'color'].map(this.renderToggle) }
        {
          this.state.color ?
            ['floor', 'accArrow', 'snapDot'].map(this.renderToggle)
          : null
        }
        {
          this.state.track ?
            <div>
              <button onClick={() => {console.log(this.state.track.lines)}}>Print lines</button>
              <button onClick={this.onTogglePlayback}>{ this.state.timer ? 'Stop' : 'Play'}</button>
              { this.renderToggle('slowmo') }
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

  // hacking time

  // componentDidMount() {
  //   // var collide = (p) => {
  //   //   if (p.x < 0) {
  //   //     p.x = 0;
  //   //   }
  //   //   if (p.x > 250) {
  //   //     p.x = 250;
  //   //   }
  //   //   if (p.y < 0) {
  //   //     p.y = 0;
  //   //   }
  //   //   if (p.y > 210) {
  //   //     p.y = 210;
  //   //   }
  //   //   this.state.theLine.collide(p);
  //   // };
  //   var i = 0;
  //   var step = () => {
  //     if (i > 130) {
  //       // this.setState({
  //       //   rider: makeRider()
  //       // });
  //       i = 0;
  //       // return;
  //     }
  //     // temp bounding box
  //     // this.state.rider.step(collide);
  //     let rider = theTrack.getRiderAtFrame(i);
  //     this.setState({rider: rider});
  //     i++;
  //   };
  //   step();
  //   setInterval(step, 1000/40);
  // },

  // render() {
  //   let scale = 1;
  //   let rider = this.state.rider;
  //   // let rider = theTrack.initRider;
  //   let {
  //     sled,
  //     body,
  //     rightArm,
  //     leftArm,
  //     rightLeg,
  //     leftLeg,
  //     scarf
  //   } = rider.bodyParts;
  //   let parts = [sled, body, rightArm, leftArm, rightLeg, leftLeg];
  //   // console.log(rider.bodyParts);
  //   // console.log(theTrack.lines);
  //   // rider.constraints.forEach((c) => console.log(c))
  //   // rider.scarfConstraints.forEach((c) => console.log(c))
  //   // parts.forEach((c) => console.log(c))
  //   // theTrack.lines.forEach((c) => console.log(c))
  //   return (
  //     <svg style={displayStyle} >
  //       {
  //         theTrack.lines.map( (line, i) =>
  //           <line  key={-10000+i}
  //             x1={scale * line.x1}
  //             y1={scale * line.y1}
  //             x2={scale * line.x2}
  //             y2={scale * line.y2}
  //             stroke='blue'
  //           />
  //         )
  //       }
  //       {
  //         rider.scarfConstraints.map((c, i) =>
  //           <line key={-i}
  //             x1={scale * c.p.x}
  //             y1={scale * c.p.y}
  //             x2={scale * c.q.x}
  //             y2={scale * c.q.y}
  //             stroke={'#ff8888'}
  //           />
  //         )
  //       }
  //       {
  //         rider.constraints.map((c, i) =>
  //           <line key={i}
  //             x1={scale * c.p.x}
  //             y1={scale * c.p.y}
  //             x2={scale * c.q.x}
  //             y2={scale * c.q.y}
  //             stroke={'#cccccc'}
  //           />
  //         )
  //       }
  //       {
  //         parts.map( (part, i) =>
  //           <line key={100+i}
  //             x1={scale * part.x}
  //             y1={scale * part.y}
  //             x2={scale * (part.x + 10 * Math.cos(part.angle))}
  //             y2={scale * (part.y + 10 * Math.sin(part.angle))}
  //             stroke='black'
  //             strokeWidth={scale * 1}
  //           />
  //         )
  //       }
  //       <circle
  //         cx={scale * (body.x + 10 * Math.cos(body.angle))}
  //         cy={scale * (body.y + 10 * Math.sin(body.angle))}
  //         r={scale * 3}
  //       />
  //     </svg>
  //   );
  // }

});

module.exports = App;
