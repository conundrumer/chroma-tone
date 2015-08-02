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
    // console.log(x, y, z, w, h)
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
    let {x, y} = this.props.track.startPosition;
    let seed = x * x + y * y;
    return (
      <div ref='container' style={this.getStyle()} >
        {
          this.props.grid ?
            <svg style={{position: 'absolute'}} viewBox={this.getViewBox()}>
              <Grid {...this.props} grid={this.props.track.store.solidGrid} />
            </svg>
          : null
        }
        <Lines {...this.props} lines={this.props.lines} viewBox={this.getViewBox()} width={this.props.width} height={this.props.height} />
        <svg style={{position: 'absolute'}} viewBox={this.getViewBox()}>
          <Rider i={0} rider={this.props.rider} frameIndex={this.props.frame} seed={seed} />
        </svg>
      </div>
    );
  }

});

module.exports = Display;
