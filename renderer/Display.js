'use strict';

var React = require('react');

import SvgEntityDisplay from './SvgEntityDisplay'

// var Rider = require('./Rider');
// import Flag from './Flag'
import LineSelection from './SvgLineSelection'
// var Grid = require('./Grid'); // TODO: make separate debug display
// var Lines = require('./SvgLineDisplay');
// var Lines = require('./CanvasLineDisplay');
// var Lines = require('./PixiLineDisplay');

const PRECISION = 1000;

function round(x) {
  return ((x * PRECISION + 0.5) | 0) / PRECISION;
}

var PropTypes = React.PropTypes;
var Display = React.createClass({

  // propTypes: {
  //   display: PropTypes.object,
  //   frame: PropTypes.number.isRequired,
  //   flagIndex: PropTypes.number.isRequired,
  //   maxIndex: PropTypes.number.isRequired,
  //   startIndex: PropTypes.number.isRequired,
  //   endIndex: PropTypes.number.isRequired,
  //   lines: PropTypes.array.isRequired,
  //   rider: PropTypes.object.isRequired,
  //   flagRider: PropTypes.object.isRequired,
  //   riders: PropTypes.arrayOf(PropTypes.object).isRequired,
  //   onionSkin: PropTypes.bool.isRequired,
  //   startPosition: PropTypes.shape({
  //     x: PropTypes.number.isRequired,
  //     y: PropTypes.number.isRequired
  //   }).isRequired,
  //   cam: PropTypes.shape({
  //     x: PropTypes.number.isRequired,
  //     y: PropTypes.number.isRequired,
  //     z: PropTypes.number.isRequired
  //   }).isRequired,
  //   width: PropTypes.number.isRequired,
  //   height: PropTypes.number.isRequired,
  //   viewOptions: PropTypes.shape({
  //     color: PropTypes.bool,
  //     floor: PropTypes.bool,
  //     accArrow: PropTypes.bool,
  //     snapDot: PropTypes.bool
  //   }),
  //   startIcon: PropTypes.element,
  //   flagIcon: PropTypes.element,
  //   endIcon: PropTypes.element,
  //   lineSelection: PropTypes.arrayOf(PropTypes.object).isRequired
  // },

  shouldComponentUpdate(nextProps) {
    return !this.props.display || this.props.display !== nextProps.display;
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
    // let viewOptions = this.props.viewOptions;
    let viewBox = this.getViewBox();
    // let {x, y} = this.props.startPosition;
    // let seed = x * x + y * y;

    let viewport = {
      ...this.props.cam,
      w: this.props.width,
      h: this.props.height
    }
    return (
      <div ref='container' style={this.getStyle()} >
        <svg style={{position: 'absolute'}} viewBox={viewBox}>
          <SvgEntityDisplay {...this.props.entities} />
        </svg>
        <LineSelection lines={this.props.lineSelection} viewport={viewport} />
      </div>
    );
  }

});

module.exports = Display;
