'use strict';

var React = require('react/addons');

var LINE_WIDTH = 2;

var Line = React.createClass({

  render() {
    return (
      <line
        x1={this.props.x1}
        y1={this.props.y1}
        x2={this.props.x2}
        y2={this.props.y2}
        stroke='black'
        strokeWidth={LINE_WIDTH}
        strokeLinecap='round'
      />
    );
  }

});

var SvgDisplay = React.createClass({

  render() {
    return (
      <svg style={{width: '100%', height: '100%', position: 'absolute'}} >
        {this.props.lines.map((l, i) =>
          <Line key={i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} />
        )}
      </svg>
    );
  }

});

module.exports = SvgDisplay;
