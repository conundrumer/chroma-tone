'use strict';

var React = require('react');
var _ = require('lodash');

const LINE_WIDTH = 2;
var { SOLID_LINE, ACC_LINE, SCENERY_LINE } = require('../core').LineTypes;

function getColor(type) {
  var blue500 = '#2196F3';
  var red500 = '#F44336';
  var lightGreen500 = '#8BC34A';
  switch (type) {
    case SOLID_LINE:
      return blue500;
    case ACC_LINE:
      return red500;
    case SCENERY_LINE:
      return lightGreen500;
  }
}

function renderLines(ctx, lines, camera, props) {
  let {x, y, z} = camera;
  let {color} = props;

  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = LINE_WIDTH / z;

  for (let i = 0; i < lines.length; i++) {
    let {x1, x2, y1, y2} = lines[i];

    ctx.moveTo(x1 / z - x, y1 / z - y);
    ctx.lineTo(x2 / z - x, y2 / z - y);
  }

  ctx.stroke();
}

function render(ctx, lines, viewport, props) {
  let { w, h, x, y, z, r } = viewport;
  z /= r;
  w *= r;
  h *= r;
  let [dx, dy] = [x / z - w / 2, y / z - h / 2];
  let camera = {x: dx, y: dy, z};

  if (!props.color) {
    renderLines(ctx, lines, camera, {color: 'black'});
    return;
  }

  let lineGroups = _.groupBy(lines, l => l.type);

  [SCENERY_LINE, SOLID_LINE, ACC_LINE].forEach( type =>
    lineGroups[type] ?
    renderLines(ctx, lineGroups[type], camera, {
      color: getColor(type)
    }) : null
  );

}

var CanvasLineDisplay = React.createClass({

  componentWillMount() {
    this.r = window.devicePixelRatio || 1;
  },

  componentDidMount() {
    this.canvas = React.findDOMNode(this.refs.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.componentDidUpdate();
  },

  linesUpdated(oldLines) {
    let lines = this.props.lines;
    return lines !== oldLines || lines.length !== oldLines.length;
  },

  componentDidUpdate(prevProps = {pan: {}}) {
    let {width: w, height: h, pan: {x, y}, zoom: z} = this.props;
    let {width: w_, height: h_, pan: {x: x_, y: y_}, zoom: z_} = prevProps;
    let r = this.r;
    var viewportChanged = false;
    if (w !== w_ || h !== h_) {
      viewportChanged = true;
    }
    if (x !== x_ || y !== y_ || z !== z_) {
      viewportChanged = true;
    }
    if (viewportChanged || this.linesUpdated(prevProps.lines)) {
      // i could cache to spend less time drawing but another time...
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      render(this.ctx, this.props.lines, { w, h, x, y, z, r }, this.props);
    }
  },

  render() {
    let {width: w, height: h} = this.props;
    // It's 100% kosher to create an empty <div> in React and populate it by hand;
    // source: http://stackoverflow.com/a/23572967
    return (
      <canvas style={{position: 'absolute', width: w, height: h}} width={w * this.r} height={h * this.r} ref='canvas' />
    );
  }

});

module.exports = CanvasLineDisplay;
