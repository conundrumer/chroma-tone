'use strict';

var React = require('react/addons');

//var Actions = require('actions/xxx')

require('styles/Editor.less');

var Editor = React.createClass({

  contextTypes: {
    muiTheme: React.PropTypes.object.isRequired
  },

  render() {
    return (
        <div className='Editor'>
          <div className='top-bar'>
            top
          </div>
          <div className='bottom-bar'>
            bottom
          </div>
        </div>
      );
  }
});

module.exports = Editor;

