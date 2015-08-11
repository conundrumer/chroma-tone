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
var { createStore, applyMiddleware, combineReducers } = require('redux');
var { Provider } = require('react-redux');
var thunk = require('redux-thunk');

var reducers = require('./reducers');
var App = require('./components/App');

const reducer = combineReducers(reducers);
const store = applyMiddleware(thunk)(createStore)(reducer);

let rootElement = document.getElementById('content');
React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  rootElement
);
