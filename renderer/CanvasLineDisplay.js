'use strict';

var React = require('react');
var _ = require('lodash');

const LINE_WIDTH = 2;
var { SOLID_LINE, ACC_LINE, SCENERY_LINE } = require('../core').LineTypes;

function getColor(type) {
  var blue500 = '#2196F3';
  var red500 = '#F44336';
  var green500 = '#4CAF50';
  switch (type) {
    case SOLID_LINE:
      return blue500;
    case ACC_LINE:
      return red500;
    case SCENERY_LINE:
      return green500;
  }
}

function renderLines(ctx, lines, camera, props) {
  let {dx, dy, z} = camera;
  let {color} = props;

  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = LINE_WIDTH / z;

  for (let i = 0; i < lines.length; i++) {
    let {x1, x2, y1, y2} = lines[i];

    ctx.moveTo(x1 / z - dx, y1 / z - dy);
    ctx.lineTo(x2 / z - dx, y2 / z - dy);
  }

  ctx.stroke();
}

function renderFloor(ctx, lines, camera) {
  let {dx, dy, z} = camera;

  ctx.beginPath();
  ctx.lineCap = 'butt';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = LINE_WIDTH / z / 2;
  let offsetAmount = LINE_WIDTH / 4;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.length === 0) {
      continue;
    }
    let offset = line.norm.clone().mulS(-offsetAmount);
    let p1 = line.p.clone().add(offset);
    let p2 = line.q.clone().add(offset);

    ctx.moveTo(p1.x / z - dx, p1.y / z - dy);
    ctx.lineTo(p2.x / z - dx, p2.y / z - dy);
  }

  ctx.stroke();

}

function renderSnapDot(ctx, lines, camera) {
  let {dx, dy, z} = camera;

  ctx.beginPath();
  ctx.fillStyle = 'black';

  let r = LINE_WIDTH / z / 2;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    if (line.leftExtended) {
      let {x1, y1} = line;
      ctx.moveTo(x1 / z - dx, y1 / z - dy);
      ctx.arc(x1 / z - dx, y1 / z - dy, r, 0, 2 * Math.PI);
    }

    if (line.rightExtended) {
      let {x2, y2} = line;
      ctx.moveTo(x2 / z - dx, y2 / z - dy);
      ctx.arc(x2 / z - dx, y2 / z - dy, r, 0, 2 * Math.PI);

    }
  }

  ctx.fill();
}

function renderAccArrow(ctx, lines, camera) {
  let {dx, dy, z} = camera;

  ctx.beginPath();
  ctx.fillStyle = getColor(ACC_LINE);

  let r = LINE_WIDTH / 2;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.length === 0) {
      continue;
    }

    let vec = line.vec.clone().divS(line.length).mulS(r);
    let norm = line.norm.clone().mulS(r);
    let p0 = line.q.clone().add(vec);
    let p1 = line.q.clone().add(vec.clone().mulS(-3.5)).add(norm.clone().mulS(3));
    let p2 = line.q.clone().add(vec.mulS(-Math.min(2, 1 + line.length / r)));

    ctx.moveTo(p0.x / z - dx, p0.y / z - dy);
    ctx.lineTo(p1.x / z - dx, p1.y / z - dy);
    ctx.lineTo(p2.x / z - dx, p2.y / z - dy);
  }

  ctx.fill();

}

function render(ctx, lines, viewport, props) {
  let { w, h, x, y, z, r } = viewport;
  z /= r;
  w *= r;
  h *= r;
  let [dx, dy] = [x / z - w / 2, y / z - h / 2];
  let camera = {dx, dy, z};

  if (!props.color) {
    renderLines(ctx, lines, camera, {color: 'black'});
    return;
  }

  let lineGroups = _.groupBy(lines, l => l.type);

  [SCENERY_LINE, SOLID_LINE, ACC_LINE].forEach( type => {
    lineGroups[type] = lineGroups[type] || [];
  });

  [SCENERY_LINE, SOLID_LINE, ACC_LINE].forEach( type =>
    renderLines(ctx, lineGroups[type], camera, {
      color: getColor(type)
    })
  );

  if (props.accArrow) {
    renderAccArrow(ctx, lineGroups[ACC_LINE], camera);
  }

  if (props.floor) {
    [SOLID_LINE, ACC_LINE].forEach( type =>
      renderFloor(ctx, lineGroups[type], camera)
    );
  }

  if (props.snapDot) {
    [SOLID_LINE, ACC_LINE].forEach( type =>
      renderSnapDot(ctx, lineGroups[type], camera)
    );
  }

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

  componentDidUpdate(prevProps = {cam: {}}) {
    let {width: w, height: h, cam: {x, y, z}} = this.props;
    let {width: w_, height: h_, cam: {x: x_, y: y_, z_}} = prevProps;
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
