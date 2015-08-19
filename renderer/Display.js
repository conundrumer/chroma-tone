'use strict';

var React = require('react');

var Rider = require('./Rider');
// var Grid = require('./Grid'); // TODO: make separate debug display
// var Lines = require('./SvgLineDisplay');
var Lines = require('./CanvasLineDisplay');
// var Lines = require('./PixiLineDisplay');

const PRECISION = 1000;

function round(x) {
  return ((x * PRECISION + 0.5) | 0) / PRECISION;
}

var PropTypes = React.PropTypes;
var Display = React.createClass({

  propTypes: {
    frame: PropTypes.number.isRequired,
    flagIndex: PropTypes.number.isRequired,
    lines: PropTypes.array.isRequired,
    rider: PropTypes.object.isRequired,
    flagRider: PropTypes.object.isRequired,
    startPosition: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }).isRequired,
    cam: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      z: PropTypes.number.isRequired
    }).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    viewOptions: PropTypes.shape({
      color: PropTypes.bool,
      floor: PropTypes.bool,
      accArrow: PropTypes.bool,
      snapDot: PropTypes.bool
    })
  },

  getViewBox() {
    let {cam: {x, y, z}, width: w, height: h} = this.props;
    return [
      round(x - w / 2 * z),
      round(y - h / 2 * z),
      round(w * z),
      round(h * z)
    ];
  },

  getStyle() {
    return {
      position: 'absolute',
      width: this.props.width,
      height: this.props.height
    };
  },

  render() {
    let viewOptions = this.props.viewOptions;
    let viewBox = this.getViewBox();
    let {x, y} = this.props.startPosition;
    let seed = x * x + y * y;
    return (
      <div ref='container' style={this.getStyle()} >
        <Lines {...this.props} {...viewOptions} lines={this.props.lines} viewBox={viewBox} width={this.props.width} height={this.props.height} />
        <svg style={{position: 'absolute'}} viewBox={viewBox}>
          <Rider i={-1} rider={this.props.flagRider} frame={this.props.flagIndex} seed={seed} flag={true} />
          <Rider i={0} rider={this.props.rider} frame={this.props.frame} seed={seed} />
        </svg>
      </div>
    );
  }

});

module.exports = Display;
