'use strict';

import _ from 'lodash'
import { getButtons } from './buttons';
import { setModKey, togglePlayPause, selectColor, deleteSelection } from './actions'

const modifierRegex = /mod|alt/;

function bindModKeys(combokeys, dispatch) {
  let modKeys = ['shift', 'mod', 'alt']

  modKeys.forEach(key => {
    combokeys.bind(key, () => dispatch(setModKey(key, true)), 'keydown')
    combokeys.bind(key, () => dispatch(setModKey(key, false)), 'keyup')
  })

  // go through every combination
  let setComboModKeys = (keys, combo) => {
    if (combo.length > 1) {
      combokeys.bind(combo.join('+'), () => dispatch(setModKey(_.last(combo), true)), 'keypress')
    }
    if (keys.length > 0) {
      keys.forEach(key => {
        setComboModKeys(_.without(keys, key), combo.concat([key]))
      })
    }
  }
  setComboModKeys(modKeys, [])

}

export default function bindHotkey(combokeys, ripples, name, hotkey, dispatch) {
  bindModKeys(combokeys, dispatch)

  let buttons = getButtons(dispatch);
  let boundAction, pressAction, releaseAction
  if (buttons[name]) {
    ({boundAction, pressAction, releaseAction} = buttons[name])
  }

  let startRipple = () => {};
  let endRipple = () => {};
  if (ripples[name]) {
    startRipple = () => ripples[name].forEach( ({start}) => start() );
    endRipple = () => ripples[name].forEach( ({end}) => end() );
  }

  if (modifierRegex.test(hotkey)) {
    // TODO: hack in multiple keyup binding
    combokeys.bind(hotkey, (e) => {
      e.preventDefault();
      if (boundAction) {
        boundAction()
      }
      startRipple();
      requestAnimationFrame(() =>
        requestAnimationFrame(endRipple)
      );
    }, 'keydown');
  } else {
    var rippled = false;
    combokeys.bind(hotkey, (e) => {
      if (pressAction) {
        pressAction()
      }
      if (!rippled) {
        startRipple();
        rippled = true;
      }
    }, 'keydown');
    combokeys.bind(hotkey, (e) => {
      if (boundAction) {
        boundAction()
      }
      if (releaseAction) {
        releaseAction()
      }
      endRipple();
      rippled = false;
    }, 'keyup');
  }

  combokeys.bind('space', e => {
    dispatch(togglePlayPause())
  })
  ;[0, 1, 2].forEach(i => {
    combokeys.bind((i+1).toString(), e => {
      dispatch(selectColor(i))
    })
  })

  combokeys.bind('backspace', e => {
    e.preventDefault()
    dispatch(deleteSelection())
  })
  combokeys.bind('mod+right', e => {
    e.preventDefault()
  })
  combokeys.bind('mod+left', e => {
    e.preventDefault()
  })
}
