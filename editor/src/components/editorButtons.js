/*eslint no-multi-spaces: 0 key-spacing: 0*/
/*eslint comma-spacing: 0*/
'use strict';

var _ = require('lodash');

module.exports = function(editor) {
  var setCursor = (hotkey) => () => editor.setCursor(hotkey);
  var buttons = {
    select:            { onTouchTap: setCursor('1')           , hotkey: '1'           , selectGroup: 'cursor'   , icon: require('icons/cursor-default')       },
    pencil:            { onTouchTap: setCursor('2')           , hotkey: '2'           , selectGroup: 'cursor'   , icon: require('icons/pencil')               },
    brush:             { onTouchTap: setCursor('3')           , hotkey: '3'           , selectGroup: 'cursor'   , icon: require('icons/brush')                },
    line:              { onTouchTap: setCursor('4')           , hotkey: '4'           , selectGroup: 'cursor'   , icon: require('./SvgIcons').Line            },
    curve:             { onTouchTap: setCursor('5')           , hotkey: '5'           , selectGroup: 'cursor'   , icon: require('./SvgIcons').Curve           },
    multiLine:         { onTouchTap: setCursor('6')           , hotkey: '6'           , selectGroup: 'cursor'   , icon: require('./SvgIcons').MultiLine       },
    eraser:            { onTouchTap: setCursor('7')           , hotkey: '7'           , selectGroup: 'cursor'   , icon: require('icons/eraser')               },
    save:              { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('icons/content-save')         },
    undo:              { onTouchTap: editor.toggleDebug       , hotkey: 'mod+z'       , selectGroup: null       , icon: require('icons/undo-variant')         },
    redo:              { onTouchTap: null                     , hotkey: 'mod+shift+z' , selectGroup: null       , icon: require('icons/redo-variant')         },
    pan:               { onTouchTap: null                     , hotkey: null          , selectGroup: 'cursor'   , icon: require('icons/cursor-move')          },
    zoom:              { onTouchTap: null                     , hotkey: null          , selectGroup: 'cursor'   , icon: require('icons/magnify')              },
    viewfinder:        { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('./SvgIcons').Viewfinder      },
    layers:            { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('icons/layers')               },
    play:              { onTouchTap: null                     , hotkey: null          , selectGroup: 'playback' , icon: require('icons/play')                 },
    pause:             { onTouchTap: null                     , hotkey: null          , selectGroup: 'playback' , icon: require('icons/pause')                },
    stop:              { onTouchTap: null                     , hotkey: null          , selectGroup: 'playback' , icon: require('icons/stop')                 },
    rewind:            { onTouchTap: null                     , hotkey: null          , selectGroup: null       , icon: require('icons/rewind')               },
    fastFoward:        { onTouchTap: null                     , hotkey: null          , selectGroup: null       , icon: require('icons/fast-forward')         },
    stepBack:          { onTouchTap: null                     , hotkey: null          , selectGroup: null       , icon: require('icons/skip-previous')        },
    stepForward:       { onTouchTap: null                     , hotkey: null          , selectGroup: null       , icon: require('icons/skip-next')            },
    flag:              { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('icons/flag-variant')         },
    multiFlag:         { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('icons/flag-outline-variant') },
    onionSkin:         { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('./SvgIcons').OnionSkin       },
    camera:            { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('icons/video')                },
    music:             { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('icons/music-note')           },
    record:            { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('icons/movie')                },
    showToolbars:      { onTouchTap: editor.showToolbars      , hotkey: null          , selectGroup: null       , icon: require('icons/chevron-down')         },
    hideToolbars:      { onTouchTap: editor.hideToolbars      , hotkey: null          , selectGroup: null       , icon: require('icons/chevron-up')           },
    toggleTimeControl: { onTouchTap: editor.toggleTimeControl , hotkey: null          , selectGroup: null       , icon: require('icons/chevron-down')         },
    chat:              { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('icons/message')              },
    settings:          { onTouchTap: null                     , hotkey: null          , selectGroup: ''         , icon: require('icons/settings')             },
    help:              { onTouchTap: editor.toggleHelp        , hotkey: 'h'           , selectGroup: 'help'     , icon: require('icons/help-circle')          }
  };

  _.forEach(buttons, (props, key) => {
    props.tooltip = _.startCase(key) + (props.hotkey ? ` (${props.hotkey || 'no hotkey assigned'})` : '');
  });

  return buttons;

};
