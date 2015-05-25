'use strict';
var injectTapEventPlugin = require("react-tap-event-plugin");
//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();
require('normalize.css');

require('../styles/fonts.css');
require('mdi/css/materialdesignicons.css');
require('../styles/main.less');
var React = require('react');

var Editor = require('./Editor');

var App = React.createClass({

  render() {
    return (
      <div className='main'>
        <Editor />
      </div>
    );
  }
});
React.render(<App />, document.getElementById('content'));

module.exports = App;
