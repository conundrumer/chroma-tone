'use strict';

var React = require('react');

const LINE_WIDTH = 2;

var CanvasLineDisplay = React.createClass({

  componentWillMount() {
    this.r = window.devicePixelRatio || 1;
  },

  componentDidMount() {
    this.canvas = React.findDOMNode(this.refs.canvas);
    this.ctx = this.canvas.getContext('2d');
    // this.r = 1;
    this.componentDidUpdate();
    // setTimeout(() => this.componentDidUpdate()); // wtf???
  },

  linesUpdated(oldLines) {
    // return true;
    let lines = this.props.lines;
    return lines !== oldLines || lines.length !== oldLines.length;
  },

  componentDidUpdate(prevProps = {pan: {}}) {
    let {width: w, height: h, pan: {x, y}, zoom: z} = this.props;
    let {width: w_, height: h_, pan: {x: x_, y: y_}, zoom: z_} = prevProps;
    let r = this.r;
    // console.log(w, h, x, y, z, r)
    var viewportChanged = false;
    if (w !== w_ || h !== h_) {
      viewportChanged = true;
      // this.renderer.resize(w, h);
    }
    if (x !== x_ || y !== y_ || z !== z_) {
      viewportChanged = true;
      // this.stage.position.set(w / 2 - x / z, h / 2 - y / z);
      // this.stage.scale.set(1 / z, 1 / z);
    }
    z /= r;
    w *= r;
    h *= r;
    let [dx, dy] = [x / z - w / 2, y / z - h / 2];
    // console.log(viewportChanged, this.linesUpdated(prevProps.lines))
    if (viewportChanged || this.linesUpdated(prevProps.lines)) {
      let lines = this.props.lines;
      let ctx = this.ctx;
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = LINE_WIDTH / z;

      // ctx.moveTo(0, 0);
      // ctx.lineTo(100, 100);

      for (let i = 0; i < lines.length; i++) {
        let {x1, x2, y1, y2} = lines[i];

        ctx.moveTo(x1 / z - dx, y1 / z - dy);
        ctx.lineTo(x2 / z - dx, y2 / z - dy);
      }

      ctx.stroke();
      // console.log("redraw")

    }
    // this.renderer.render(this.stage);
  },

  render() {
    let {width: w, height: h} = this.props;
    // It's 100% kosher to create an empty <div> in React and populate it by hand;
    // source: http://stackoverflow.com/a/23572967
    return (
      <canvas key={this.props.label} style={{position: 'absolute', width: w, height: h}} width={w * this.r} height={h * this.r} ref='canvas' />
    );
  }

});

module.exports = CanvasLineDisplay;
