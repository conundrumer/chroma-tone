'use strict';
var injectTapEventPlugin = require("react-tap-event-plugin");
//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();
require('normalize.css');

require('assets/css/fonts.css');
require('./styles/main.less');

var React = require('react');
var { createStore, combineReducers } = require('redux');
var { Provider } = require('react-redux');

var initWindowResizeHandler = require('./windowResize');
var { windowSize } = require('./reducers');
var App = require('./components/App');

let editorApp = combineReducers({ windowSize });
let store = createStore(editorApp);


initWindowResizeHandler(store.dispatch);

let rootElement = document.getElementById('content');
React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  rootElement
);
