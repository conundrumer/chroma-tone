/*eslint no-multi-spaces: 0 key-spacing: 0*/
/*eslint comma-spacing: 0*/
/*eslint standard/object-curly-even-spacing: 0*/
'use strict';

import _ from 'lodash';

import {
  showToolbars,
  hideToolbars,
  toggleTimeControl,
  toggleButton,
  setTool,
  incFrameIndex,
  decFrameIndex,
  setPlaybackState,
  modPlaybackState,
  newTrack,
  showFileLoader,
  setFlag,
  showTrackSaver,
  undo,
  redo
} from './actions';
import Icons from './components/SvgIcons';

let debugThunk = (name) => () => console.log(name);

export function getButtons(dispatch) {
  let reverseActions = [
    modPlaybackState('reverse'),
    modPlaybackState()
  ]
  let forwardActions = [
    modPlaybackState('forward'),
    modPlaybackState()
  ]
  return _.forEach({
    select:            { action: setTool             , hotkey: 'a'           , icon: require('icons/cursor-default') },
    marble:            { action: setTool             , hotkey: 'q'           , icon: require('icons/checkbox-blank-circle-outline')},
    brush:             { action: null                , hotkey: '3'           , icon: require('icons/brush')          },
    line:              { action: setTool             , hotkey: 'w'           , icon: Icons.Line                      },
    curve:             { action: null                , hotkey: '5'           , icon: Icons.Curve                     },
    multiLine:         { action: null                , hotkey: '6'           , icon: Icons.MultiLine                 },
    eraser:            { action: setTool             , hotkey: 'e'           , icon: require('icons/eraser')         },
    undo:              { action: undo                , hotkey: 'mod+z'       , icon: require('icons/undo-variant')   },
    redo:              { action: redo                , hotkey: 'mod+shift+z' , icon: require('icons/redo-variant')   },
    pan:               { action: setTool             , hotkey: 'r'           , icon: require('icons/cursor-move')    },
    zoom:              { action: setTool             , hotkey: 't'           , icon: require('icons/magnify')        },
    viewfinder:        { action: null                , hotkey: null          , icon: Icons.Viewfinder                },
    layers:            { action: null                , hotkey: null          , icon: require('icons/layers')         },
    play:              { action: setPlaybackState    , hotkey: 'b'           , icon: require('icons/play')           },
    pause:             { action: setPlaybackState    , hotkey: 'n'           , icon: require('icons/pause')          },
    stop:              { action: setPlaybackState    , hotkey: 'm'           , icon: require('icons/stop')           },
    reverse:           { action: reverseActions      , hotkey: 'left'        , icon: require('icons/rewind')         },
    forward:           { action: forwardActions      , hotkey: 'right'       , icon: require('icons/fast-forward')   },
    stepBack:          { action: decFrameIndex()     , hotkey: 'shift+left'  , icon: require('icons/skip-previous')  },
    stepForward:       { action: incFrameIndex()     , hotkey: 'shift+right' , icon: require('icons/skip-next')      },
    flag:              { action: setFlag()           , hotkey: 'c'           , icon: require('icons/flag-variant')   },
    slowmo:            { action: setPlaybackState    , hotkey: 'v'           , icon: Icons.SlowMotion                },
    onionSkin:         { action: toggleButton        , hotkey: 'o'           , icon: Icons.OnionSkin                 },
    camera:            { action: null                , hotkey: null          , icon: require('icons/video')          },
    music:             { action: null                , hotkey: null          , icon: require('icons/music-note')     },
    record:            { action: null                , hotkey: null          , icon: require('icons/movie')          },
    showToolbars:      { action: showToolbars()      , hotkey: null          , icon: require('icons/chevron-down')   },
    hideToolbars:      { action: hideToolbars()      , hotkey: null          , icon: require('icons/chevron-up')     },
    toggleTimeControl: { action: toggleTimeControl() , hotkey: null          , icon: require('icons/chevron-down')   },
    chat:              { action: null                , hotkey: null          , icon: require('icons/message')        },
    settings:          { action: null                , hotkey: null          , icon: require('icons/settings')       },
    help:              { action: toggleButton        , hotkey: 'h'           , icon: require('icons/help-circle')    },
    saveLoadNew:       { action: () => () => {}      , hotkey: null          , icon: require('icons/floppy')         },
    file:              { action: () => () => {}      , hotkey: null          , icon: require('icons/content-save')   },
    save:              { action: null                , hotkey: null          , icon: require('icons/download')       },
    load:              { action: null                , hotkey: null          , icon: require('icons/upload')         },
    saveAs:            { action: showTrackSaver()    , hotkey: null          , icon: require('icons/folder-download')},
    loadFromFile:      { action: showFileLoader()    , hotkey: null          , icon: require('icons/folder-upload')  },
    saveToServer:      { action: null                , hotkey: null          , icon: require('icons/cloud-upload')   },
    savedToServer:     { action: null                , hotkey: null          , icon: require('icons/cloud-check')    },
    loadFromServer:    { action: null                , hotkey: null          , icon: require('icons/cloud-download') },
    addCheckpoint:     { action: null                , hotkey: null          , icon: require('icons/flag')           },
    history:           { action: null                , hotkey: null          , icon: require('icons/history')        },
    editInfo:          { action: null                , hotkey: null          , icon: require('icons/pencil')         },
    new:               { action: () => newTrack()    , hotkey: null          , icon: require('icons/file')           },
  }, (props, key) => {
    props.name = key;
    props.tooltip = _.startCase(key) + (props.hotkey ? ` (${props.hotkey})` : '');
    if (props.action instanceof Function) {
      props.action = props.action(key);
    }
    if (props.action instanceof Array && dispatch) {
      props.pressAction = () => dispatch(props.action[0])
      props.releaseAction = () => dispatch(props.action[1])
    } else if (props.action && dispatch) {
      props.boundAction = () => dispatch(props.action);
    }
  });
}

export function getMenus(b) {
  return {
    saveLoadNew: {
      openDirection: 'bottom-right',
      items: [
        b.save,
        b.load,
        b.new
      ]
    },
    file: {
      openDirection: 'bottom-right',
      items: [
        b.addCheckpoint,
        b.history,
        b.editInfo,
        b.save,
        b.load,
        b.saveAs,
        b.loadFromFile,
        b.new
      ]
    },
  };
}

export function getButtonGroups(b) {
  return {
    float: {
      left: [
        b.undo
      ],
      middle: [
        b.marble,
        b.line,
        b.eraser,
        b.pan,
        b.zoom,
        b.play,
        b.stop,
        b.flag,
        b.saveLoadNew,
        b.help
      ],
      right: [
        b.showToolbars
      ]
    },
    top: {
      left: [
        b.file,
        b.settings,
        b.chat,
      ],
      middle: [
        b.select,
        b.marble,
        b.brush,
        b.line,
        b.curve,
        b.multiLine,
        b.eraser
      ],
      right: [
        b.undo,
        b.redo,
        b.hideToolbars,
      ]
    },
    bottom: {
      left: [
        b.toggleTimeControl,
        b.help,
        b.record,
        b.camera,
      ],
      middle: [
        b.flag,
        b.slowmo,
        b.play,
        b.pause,
        b.stop,
      ],
      right: [
        b.pan,
        b.zoom,
        b.viewfinder,
        b.layers,
      ]
    },
    timeControl: {
      left: [
        b.music,
        b.reverse,
        b.stepBack,
      ],
      middle: [],
      right: [
        b.stepForward,
        b.forward,
        b.onionSkin,
      ]
    },
  };
}
