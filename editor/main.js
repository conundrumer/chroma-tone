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

let render = (store, rootElement) => {
  React.render(
    <Provider store={store}>
      {() => <App />}
    </Provider>,
    rootElement
  );
}

import simStateStep from './simStateStepMiddleware'

let enhanceStore = applyMiddleware(thunk, simStateStep())
if (__DEVTOOLS__) {  // eslint-disable-line no-undef

  let { devTools, persistState } = require('redux-devtools')
  let { DevTools, DebugPanel, LogMonitor } = require('redux-devtools/lib/react')
  let { compose } = require('redux')
  let Immutable = require('immutable')

  let makeLineStore = lineStore => Immutable.Map(lineStore).mapKeys(key => parseInt(key, 10))

  enhanceStore = compose(
    enhanceStore,
    devTools(),
    persistState(
      window.location.href.match(/[?&]debug_session=([^&]+)\b/),
      state => state && ({...state,
        trackData: {...state.trackData,
          lineStore: makeLineStore(state.trackData.lineStore)
        },
        history: {
          undoStack: Immutable.Stack(state.history.undoStack),
          redoStack: Immutable.Stack(state.history.redoStack)
        }
      })
    )
  )

  render = (store, rootElement) => {
    React.render(
      <div>
        <Provider store={store}>
          {() => <App />}
        </Provider>
        <DebugPanel top right bottom>
          <DevTools store={store} monitor={LogMonitor} />
        </DebugPanel>
      </div>,
      rootElement
    );
  }

}

const reducer = combineReducers(reducers);
const createAppStore = enhanceStore(createStore)

render(createAppStore(reducer), document.getElementById('content'))
