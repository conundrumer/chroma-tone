'use strict';

var React = require('react');

var Rider = require('./Rider');
var Grid = require('./Grid');
var Lines = require('./Lines');

var displayStyle = {
  position: 'absolute',
  width: '100%'
};

var Display = React.createClass({

  getViewBox() {
    return this.props.viewBox.join(' ') || '0 0 0 0';
  },

  render() {
    return (
      <div style={displayStyle} >
        <svg style={displayStyle} viewBox={this.getViewBox()}>
          {
            this.props.grid ?
              <Grid {...this.props} grid={this.props.track.store.solidGrid} />
            : null
          }
          <Lines {...this.props} lines={this.props.track.lines} />
          <Rider rider={this.props.rider} />
        </svg>
      </div>
    );
  }

});

module.exports = Display;
