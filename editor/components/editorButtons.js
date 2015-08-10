/*eslint no-multi-spaces: 0 key-spacing: 0*/
/*eslint comma-spacing: 0*/
'use strict';

var _ = require('lodash');
var { bindActionCreators } = require('redux');

var Icons = require('./SvgIcons');
var { showToolbars, hideToolbars, toggleTimeControl, toggleHelp, setCursor } = require('../actions');

function getButtons(dispatch) {
  var actions = bindActionCreators({ showToolbars, hideToolbars, toggleTimeControl, toggleHelp }, dispatch);
  var makeSetCursor = (hotkey) => () => dispatch(setCursor(hotkey));
  var buttons = {
    select:            { onTouchTap: makeSetCursor('1')        , hotkey: '1'           , selectGroup: 'cursor'   , icon: require('icons/cursor-default')       },
    pencil:            { onTouchTap: makeSetCursor('2')        , hotkey: '2'           , selectGroup: 'cursor'   , icon: require('icons/pencil')               },
    brush:             { onTouchTap: makeSetCursor('3')        , hotkey: '3'           , selectGroup: 'cursor'   , icon: require('icons/brush')                },
    line:              { onTouchTap: makeSetCursor('4')        , hotkey: '4'           , selectGroup: 'cursor'   , icon: Icons.Line                            },
    curve:             { onTouchTap: makeSetCursor('5')        , hotkey: '5'           , selectGroup: 'cursor'   , icon: Icons.Curve                           },
    multiLine:         { onTouchTap: makeSetCursor('6')        , hotkey: '6'           , selectGroup: 'cursor'   , icon: Icons.MultiLine                       },
    eraser:            { onTouchTap: makeSetCursor('7')        , hotkey: '7'           , selectGroup: 'cursor'   , icon: require('icons/eraser')               },
    save:              { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: require('icons/content-save')         },
    undo:              { onTouchTap: null                      , hotkey: 'mod+z'       , selectGroup: null       , icon: require('icons/undo-variant')         },
    redo:              { onTouchTap: null                      , hotkey: 'mod+shift+z' , selectGroup: null       , icon: require('icons/redo-variant')         },
    pan:               { onTouchTap: null                      , hotkey: null          , selectGroup: 'cursor'   , icon: require('icons/cursor-move')          },
    zoom:              { onTouchTap: null                      , hotkey: null          , selectGroup: 'cursor'   , icon: require('icons/magnify')              },
    viewfinder:        { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: Icons.Viewfinder                      },
    layers:            { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: require('icons/layers')               },
    play:              { onTouchTap: null                      , hotkey: null          , selectGroup: 'playback' , icon: require('icons/play')                 },
    pause:             { onTouchTap: null                      , hotkey: null          , selectGroup: 'playback' , icon: require('icons/pause')                },
    stop:              { onTouchTap: null                      , hotkey: null          , selectGroup: 'playback' , icon: require('icons/stop')                 },
    rewind:            { onTouchTap: null                      , hotkey: null          , selectGroup: null       , icon: require('icons/rewind')               },
    fastFoward:        { onTouchTap: null                      , hotkey: null          , selectGroup: null       , icon: require('icons/fast-forward')         },
    stepBack:          { onTouchTap: null                      , hotkey: null          , selectGroup: null       , icon: require('icons/skip-previous')        },
    stepForward:       { onTouchTap: null                      , hotkey: null          , selectGroup: null       , icon: require('icons/skip-next')            },
    flag:              { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: require('icons/flag-variant')         },
    slowmo:            { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: Icons.SlowMotion                      },
    onionSkin:         { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: Icons.OnionSkin                       },
    camera:            { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: require('icons/video')                },
    music:             { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: require('icons/music-note')           },
    record:            { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: require('icons/movie')                },
    showToolbars:      { onTouchTap: actions.showToolbars      , hotkey: null          , selectGroup: null       , icon: require('icons/chevron-down')         },
    hideToolbars:      { onTouchTap: actions.hideToolbars      , hotkey: null          , selectGroup: null       , icon: require('icons/chevron-up')           },
    toggleTimeControl: { onTouchTap: actions.toggleTimeControl , hotkey: null          , selectGroup: null       , icon: require('icons/chevron-down')         },
    chat:              { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: require('icons/message')              },
    settings:          { onTouchTap: null                      , hotkey: null          , selectGroup: ''         , icon: require('icons/settings')             },
    help:              { onTouchTap: actions.toggleHelp        , hotkey: 'h'           , selectGroup: 'help'     , icon: require('icons/help-circle')          }
  };

  _.forEach(buttons, (props, key) => {
    props.tooltip = _.startCase(key) + (props.hotkey ? ` (${props.hotkey || 'no hotkey assigned'})` : '');
  });

  return buttons;

}

function getButtonGroups(dispatch) {
  let b = getButtons(dispatch);

  let buttonGroups = {
    float: {
      left: [
        b.undo
      ],
      middle: [
        b.pencil, b.line, b.eraser, b.pan, b.zoom, b.play, b.stop, b.flag, b.save, b.help
      ],
      right: [
        b.showToolbars
      ]
    },
    top: {
      left: [
        b.save, b.undo, b.redo
      ],
      middle: [
        b.select, b.pencil, b.brush, b.line, b.curve, b.multiLine, b.eraser
      ],
      right: [
        b.settings, b.chat, b.hideToolbars
      ]
    },
    bottom: {
      left: [
        b.layers, b.viewfinder, b.pan, b.zoom
      ],
      middle: [
        b.flag, b.slowmo, b.play, b.stop, b.pause
      ],
      right: [
        b.camera, b.record, b.help, b.toggleTimeControl
      ]
    },
    timeControl: {
      left: [
        b.onionSkin, b.rewind, b.stepBack
      ],
      middle: [],
      right: [
        b.stepForward, b.fastFoward, b.music
      ]
    }
  };

  return {
    buttons: b,
    buttonGroups
  };
}

module.exports = getButtonGroups;
