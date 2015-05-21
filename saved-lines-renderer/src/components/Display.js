'use strict';

var React = require('react');
var LINE_WIDTH = 2;

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
        box[0] - LINE_WIDTH, // top
        box[1] - LINE_WIDTH, // left
        box[2] - box[0] + 2 * LINE_WIDTH, // width
        box[3] - box[1] + 2 * LINE_WIDTH // height
    ];
}

function getColor(type) {
  switch (type) {
    case 0: // normal
      return 'blue';
    case 1: // acc
      return 'red';
    case 2: // scenery
      return 'green';
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
        strokeWidth={LINE_WIDTH}
        strokeLinecap='round'
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

  render() {
    var lines = this.props.track.lines;
    var viewBox = this.props.viewBox || getViewBox(lines).join(' ');
    return (
      <svg style={displayStyle} viewBox={viewBox}>
      {
        lines.map((line, i) =>
          <Line {...line} key={i} color={this.props.color ? getColor(line.type) : 'black'}/>
        )
      }
      </svg>
    );
  }

});

module.exports = Display;
