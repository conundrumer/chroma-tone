/*eslint no-multi-spaces: 0 key-spacing: 0*/
/*eslint comma-spacing: 0*/
'use strict';

import _ from 'lodash';

import {
  showToolbars,
  hideToolbars,
  toggleTimeControl,
  hideLeftNav,
  toggleButton,
  setTool,

} from './actions';
import Icons from './components/SvgIcons';

let debugThunk = (name) => () => console.log(name);

export function getButtons(dispatch) {
  return _.forEach({
    select:            { action: null                , hotkey: '1'           , icon: require('icons/cursor-default') },
    pencil:            { action: null                , hotkey: '2'           , icon: require('icons/pencil')         },
    brush:             { action: null                , hotkey: '3'           , icon: require('icons/brush')          },
    line:              { action: null                , hotkey: '4'           , icon: Icons.Line                      },
    curve:             { action: null                , hotkey: '5'           , icon: Icons.Curve                     },
    multiLine:         { action: null                , hotkey: '6'           , icon: Icons.MultiLine                 },
    eraser:            { action: null                , hotkey: '7'           , icon: require('icons/eraser')         },
    undo:              { action: debugThunk          , hotkey: 'mod+z'       , icon: require('icons/undo-variant')   },
    redo:              { action: debugThunk          , hotkey: 'mod+shift+z' , icon: require('icons/redo-variant')   },
    pan:               { action: setTool             , hotkey: null          , icon: require('icons/cursor-move')    },
    zoom:              { action: setTool             , hotkey: null          , icon: require('icons/magnify')        },
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
    help:              { action: toggleButton        , hotkey: 'h'           , icon: require('icons/help-circle')    },
    saveLoadNew:       { action: () => () => {}      , hotkey: null          , icon: require('icons/floppy')         },
    file:              { action: () => () => {}      , hotkey: null          , icon: require('icons/content-save')   },
    save:              { action: null                , hotkey: null          , icon: require('icons/download')       },
    load:              { action: null                , hotkey: null          , icon: require('icons/upload')         },
    saveToFile:        { action: null                , hotkey: null          , icon: require('icons/folder-download')},
    loadFromFile:      { action: null                , hotkey: null          , icon: require('icons/folder-upload')  },
    saveToServer:      { action: null                , hotkey: null          , icon: require('icons/cloud-upload')   },
    savedToServer:     { action: null                , hotkey: null          , icon: require('icons/cloud-check')    },
    loadFromServer:    { action: null                , hotkey: null          , icon: require('icons/cloud-download') },
    addCheckpoint:     { action: null                , hotkey: null          , icon: require('icons/flag')           },
    history:           { action: null                , hotkey: null          , icon: require('icons/history')        },
    editInfo:          { action: null                , hotkey: null          , icon: require('icons/pencil')         },
    new:               { action: null                , hotkey: null          , icon: require('icons/file')           },
  }, (props, key) => {
    props.name = key;
    props.tooltip = _.startCase(key) + (props.hotkey ? ` (${props.hotkey})` : '');
    if (props.action instanceof Function) {
      props.action = props.action(key);
    }
    if (props.action && dispatch) {
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
        b.saveToFile,
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
        b.pencil,
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
        b.undo,
        b.redo
      ],
      middle: [
        b.select,
        b.pencil,
        b.brush,
        b.line,
        b.curve,
        b.multiLine,
        b.eraser
      ],
      right: [
        b.settings,
        b.chat,
        b.hideToolbars
      ]
    },
    bottom: {
      left: [
        b.layers,
        b.viewfinder,
        b.pan,
        b.zoom
      ],
      middle: [
        b.flag,
        b.slowmo,
        b.play,
        b.stop,
        b.pause
      ],
      right: [
        b.camera,
        b.record,
        b.help,
        b.toggleTimeControl
      ]
    },
    timeControl: {
      left: [
        b.onionSkin,
        b.rewind,
        b.stepBack
      ],
      middle: [],
      right: [
        b.stepForward,
        b.fastFoward,
        b.music
      ]
    },
  };
}
