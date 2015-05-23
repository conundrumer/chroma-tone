'use strict';
var injectTapEventPlugin = require("react-tap-event-plugin");
//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();
// require('normalize.css');

require('../styles/main.less');

var React = require('react');
var {RaisedButton} = require('material-ui');

var App = React.createClass({
  render: function() {
    return (
      <div className='main'>
        <RaisedButton label="MATERIAL BUTTON!" />
      </div>
    );
  }
});
React.render(<App />, document.getElementById('content'));

module.exports = App;
