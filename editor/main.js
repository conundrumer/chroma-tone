'use strict';
var injectTapEventPlugin = require("react-tap-event-plugin");
//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();
require('normalize.css');

require('assets/fonts.css');
require('./styles/main.less');

var React = require('react');
var { createStore, applyMiddleware, combineReducers } = require('redux');
var { Provider } = require('react-redux');
var thunk = require('redux-thunk');

var reducers = require('./reducers');
var App = require('./components/App');

let middlewares = [thunk]
if (process.env.NODE_ENV !== 'production') {
  let options = { collapsed: true }
  middlewares.push(require('redux-logger')(options))

  let {ADD_LINE, REMOVE_LINE, REPLACE_LINE} = require('./actions')
  middlewares.push((store) => (next) => (action) => {
    let {trackData: {track, lineStore}} = store.getState()
    switch (action.type) {
      case ADD_LINE:
      case REMOVE_LINE:
      case REPLACE_LINE:
        console.log('before', track, lineStore)
    }
    let result = next(action)
    ;({trackData: {track, lineStore}} = store.getState())
    switch (action.type) {
      case ADD_LINE:
      case REMOVE_LINE:
      case REPLACE_LINE:
        console.log('after', track, lineStore)
    }
    return result
  })
}

const reducer = combineReducers(reducers);
const store = applyMiddleware(...middlewares)(createStore)(reducer);

let rootElement = document.getElementById('content');
React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  rootElement
);
