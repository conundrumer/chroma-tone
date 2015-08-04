'use strict';

var React = require('react');

var Rider = require('./Rider');
var Grid = require('./Grid');
// var Lines = require('./SvgLineDisplay');
var Lines = require('./CanvasLineDisplay');
// var Lines = require('./PixiLineDisplay');

var Display = React.createClass({

  getViewBox() {
    let {pan: {x, y}, zoom: z, width: w, height: h} = this.props;
    return [
      x - w / 2 * z,
      y - h / 2 * z,
      w * z,
      h * z
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
    let viewBox = this.getViewBox();
    let {x, y} = this.props.track.startPosition;
    let seed = x * x + y * y;
    return (
      <div ref='container' style={this.getStyle()} >
        {
          this.props.grid ?
            <svg style={{position: 'absolute'}} viewBox={viewBox}>
              <Grid {...this.props} grid={this.props.track.store.solidGrid} />
            </svg>
          : null
        }
        <Lines {...this.props} lines={this.props.lines} viewBox={viewBox} width={this.props.width} height={this.props.height} />
        <svg style={{position: 'absolute'}} viewBox={viewBox}>
          <Rider i={0} rider={this.props.rider} frameIndex={this.props.frame} seed={seed} />
        </svg>
      </div>
    );
  }

});

module.exports = Display;
