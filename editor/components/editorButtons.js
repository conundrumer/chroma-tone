/*eslint no-multi-spaces: 0 key-spacing: 0*/
/*eslint comma-spacing: 0*/
'use strict';

var _ = require('lodash');

var Icons = require('./SvgIcons');
var { showToolbars, hideToolbars, toggleTimeControl, toggleHelp, setCursor } = require('../actions');

function getButtons() {
  var buttons = {
    select:            { action: setCursor('1')      , hotkey: '1'           , icon: require('icons/cursor-default') },
    pencil:            { action: setCursor('2')      , hotkey: '2'           , icon: require('icons/pencil')         },
    brush:             { action: setCursor('3')      , hotkey: '3'           , icon: require('icons/brush')          },
    line:              { action: setCursor('4')      , hotkey: '4'           , icon: Icons.Line                      },
    curve:             { action: setCursor('5')      , hotkey: '5'           , icon: Icons.Curve                     },
    multiLine:         { action: setCursor('6')      , hotkey: '6'           , icon: Icons.MultiLine                 },
    eraser:            { action: setCursor('7')      , hotkey: '7'           , icon: require('icons/eraser')         },
    save:              { action: null                , hotkey: null          , icon: require('icons/content-save')   },
    undo:              { action: null                , hotkey: 'mod+z'       , icon: require('icons/undo-variant')   },
    redo:              { action: null                , hotkey: 'mod+shift+z' , icon: require('icons/redo-variant')   },
    pan:               { action: null                , hotkey: null          , icon: require('icons/cursor-move')    },
    zoom:              { action: null                , hotkey: null          , icon: require('icons/magnify')        },
    viewfinder:        { action: null                , hotkey: null          , icon: Icons.Viewfinder                },
    layers:            { action: null                , hotkey: null          , icon: require('icons/layers')         },
    play:              { action: null                , hotkey: null          , icon: require('icons/play')           },
    pause:             { action: null                , hotkey: null          , icon: require('icons/pause')          },
    stop:              { action: null                , hotkey: null          , icon: require('icons/stop')           },
    rewind:            { action: null                , hotkey: null          , icon: require('icons/rewind')         },
    fastFoward:        { action: null                , hotkey: null          , icon: require('icons/fast-forward')   },
    stepBack:          { action: null                , hotkey: null          , icon: require('icons/skip-previous')  },
    stepForward:       { action: null                , hotkey: null          , icon: require('icons/skip-next')      },
    flag:              { action: null                , hotkey: null          , icon: require('icons/flag-variant')   },
    slowmo:            { action: null                , hotkey: null          , icon: Icons.SlowMotion                },
    onionSkin:         { action: null                , hotkey: null          , icon: Icons.OnionSkin                 },
    camera:            { action: null                , hotkey: null          , icon: require('icons/video')          },
    music:             { action: null                , hotkey: null          , icon: require('icons/music-note')     },
    record:            { action: null                , hotkey: null          , icon: require('icons/movie')          },
    showToolbars:      { action: showToolbars()      , hotkey: null          , icon: require('icons/chevron-down')   },
    hideToolbars:      { action: hideToolbars()      , hotkey: null          , icon: require('icons/chevron-up')     },
    toggleTimeControl: { action: toggleTimeControl() , hotkey: null          , icon: require('icons/chevron-down')   },
    chat:              { action: null                , hotkey: null          , icon: require('icons/message')        },
    settings:          { action: null                , hotkey: null          , icon: require('icons/settings')       },
    help:              { action: toggleHelp()        , hotkey: 'h'           , icon: require('icons/help-circle')    }
  };

  _.forEach(buttons, (props, key) => {
    props.tooltip = _.startCase(key) + (props.hotkey ? ` (${props.hotkey || 'no hotkey assigned'})` : '');
  });

  return buttons;

}

function getButtonGroups() {
  let b = getButtons();

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
