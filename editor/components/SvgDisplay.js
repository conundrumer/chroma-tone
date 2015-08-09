'use strict';

var React = require('react/addons');

var LINE_WIDTH = 2;

var lightBlue500 = '#03A9F4';
var red500 = '#F44336';
var lightGreen500 = '#8BC34A';

function getOffset(x1, y1, x2, y2) {
  var offsetDistance = LINE_WIDTH / 1.5;
  var x = y2 - y1;
  var y = -(x2 - x1);
  var length = Math.sqrt(x * x + y * y);
  x = offsetDistance * x / length;
  y = offsetDistance * y / length;
  return {
    x1: x1 + x,
    y1: y1 + y,
    x2: x2 + x,
    y2: y2 + y
  };
}

var Line = React.createClass({

  render() {
    var {x1, y1, x2, y2, lineType} = this.props;
    var baseLine = (
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={lineType === 2 ? lightGreen500 : 'black'}
        strokeWidth={LINE_WIDTH}
        strokeLinecap='round'
      />
    );
    if (lineType === 2) {
      return baseLine;
    }
    var offset = getOffset(x1, y1, x2, y2);
    return (
      <g>
        <line
          x1={offset.x1} y1={offset.y1} x2={offset.x2} y2={offset.y2}
          stroke={lineType === 0 ? lightBlue500 : red500}
          strokeWidth={LINE_WIDTH}
          strokeLinecap='round'
        />
        {baseLine}
      </g>
    );
  }

});

var SvgDisplay = React.createClass({

  render() {
    return (
      <svg style={{width: '100%', height: '100%', position: 'absolute'}} >
        {this.props.lines.map((l, i) =>
          <Line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} lineType={l[4]} />
        )}
      </svg>
    );
  }

});

module.exports = SvgDisplay;
