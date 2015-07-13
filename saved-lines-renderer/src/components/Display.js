'use strict';

var React = require('react');
var _ = require('lodash');

var LINE_WIDTH = 2;
var LINE_WIDTH_ZOOM_FACTOR = 0.001;
var MARGIN = 20;

function getLength(x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// relative offset from normal and parallel
function getOffset(x1, y1, x2, y2, offset) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let length = Math.sqrt(dx * dx + dy * dy);
  let px = offset.p * dx / length;
  let py = offset.p * dy / length;
  let nx = offset.n * dy / length;
  let ny = offset.n * -dx / length;
  return {
    x1: x1 + nx + px,
    y1: y1 + ny + py,
    x2: x2 + nx + px,
    y2: y2 + ny + py
  };
}

function getViewBox(lines) {
    // console.log('lines', lines)
    var box = [].concat.apply([], lines.map(line =>
      [{
        x: line.x1,
        y: line.y1
      }, {
        x: line.x2,
        y: line.y2
      }]
    ))
    .map(p => {
        return [p.x, p.y, p.x, p.y];
    })
    .reduce((a, b) => {
        return [
            Math.min(a[0], b[0]),
            Math.min(a[1], b[1]),
            Math.max(a[2], b[2]),
            Math.max(a[3], b[3])
        ];
    }, [
        Number.MAX_VALUE,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.MIN_VALUE
    ]);
    return [
        box[0] - LINE_WIDTH - MARGIN, // top
        box[1] - LINE_WIDTH - MARGIN, // left
        box[2] - box[0] + 2 * MARGIN, // width
        box[3] - box[1] + 2 * MARGIN // height
    ];
}

function getColor(type) {
  var blue500 = '#2196F3';
  var red500 = '#F44336';
  var lightGreen500 = '#8BC34A';
  switch (type) {
    case 0: // normal
      return blue500;
    case 1: // acc
      return red500;
    case 2: // scenery
      return lightGreen500;
  }
}

var Line = React.createClass({
  render() {
    return (
      <line
        x1={this.props.x1}
        y1={this.props.y1}
        x2={this.props.x2}
        y2={this.props.y2}
        stroke={this.props.color}
        strokeWidth={LINE_WIDTH * this.props.zoom}
        strokeLinecap='round'
      />
    );
  }
});

var FloorLine = React.createClass({
  render() {
    let {x1, y1, x2, y2} = this.props;
    let width = LINE_WIDTH * this.props.zoom / 2;
    let offset = width / 2 * (this.props.flipped ? -1 : 1);
    return (
      <line {...getOffset(x1, y1, x2, y2, {p: 0, n: offset})}
        stroke='black'
        strokeWidth={width}
        strokeLinecap='butt'
      />
    );
  }
});

var AccArrow = React.createClass({
  render() {
    let {x1, y1, x2, y2} = this.props;
    let r = LINE_WIDTH * this.props.zoom / 2;
    let side = this.props.flipped ? 1 : -1;
    // omg i really need actual vectors
    let o0 = getOffset(x1, y1, x2, y2, { p: r, n: 0 });
    let o1 = getOffset(x1, y1, x2, y2, { p: -3.5 * r, n: 3 * r * side });
    let o2 = getOffset(x1, y1, x2, y2, { p: -Math.min(2 * r, r + getLength(x1, y1, x2, y2)), n: 0 });
    return (
      <polyline
        points={
          [o0.x2, o0.y2, o1.x2, o1.y2, o2.x2, o2.y2]
        }
        fill={getColor(1)}
      />
    );
  }

});

var displayStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%'
};

var Display = React.createClass({

  getViewBox() {
    return this.props.viewBox || getViewBox(this.props.track.lines).join(' ');
  },

  getZoomFactor() {
    let dim = this.getViewBox().split(' ');
    let zoom = dim[2]; // width
    return Math.max(1, Math.pow(zoom * LINE_WIDTH_ZOOM_FACTOR, 0.5));
  },

  renderLineArray(line, i) {
    let zoom = this.getZoomFactor();
    let r = LINE_WIDTH * zoom / 2;
    let isScenery = (line.type === 2);
    if (!this.props.color || isScenery) {
      return [ <Line {...line} key={i} color={ this.props.color ? getColor(2) : 'black'} zoom={zoom}/> ];
    }
    let parts = [
      <Line {...line} key={i} color={getColor(line.type)} zoom={zoom}/>
    ];
    if (this.props.floor) {
      parts = parts.concat([
        <FloorLine {...line} key={-i - 1} zoom={zoom}/>
      ]);
    }
    if (this.props.accArrow && line.type === 1) {
      parts = [
        <AccArrow {...line} key={'_' + i} zoom={zoom} />
      ].concat(parts);
    }
    if (!this.props.snapDot) {
      return parts;
    }
    if (line.extended & 1) { // left extension
      parts = parts.concat([
        <circle key={'e'+i} cx={line.x1} cy={line.y1} r={r} fill='black' />
      ]);
    }
    if (line.extended & 2) { // right extension
      parts = parts.concat([
        <circle key={'e'+(-i-1)} cx={line.x2} cy={line.y2} r={r} fill='black' />
      ]);
    }
    return parts;
  },

  render() {
    return (
      <svg style={displayStyle} viewBox={this.getViewBox()}>
        { _.flatten(this.props.track.lines.map(this.renderLineArray)) }
      </svg>
    );
  }

});

module.exports = Display;
