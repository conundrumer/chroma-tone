'use strict';

var React = require('react');

var Display = React.createClass({

  render() {
    return (
      <div>color: { this.props.color.toString() } { JSON.stringify(this.props.track) }</div>
    );
  }

});

module.exports = Display;
