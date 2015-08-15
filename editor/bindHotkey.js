'use strict';

import { getButtons } from './buttons';

const modifierRegex = /mod|alt/;

export default function bindHotkey(combokeys, ripples, name, hotkey, dispatch) {
  let buttons = getButtons(dispatch);
  let boundAction = buttons[name] && buttons[name].boundAction || (() => {});

  let startRipple = () => {};
  let endRipple = () => {};
  if (ripples[name]) {
    startRipple = () => ripples[name].forEach( ({start}) => start() );
    endRipple = () => ripples[name].forEach( ({end}) => end() );
  }

  if (modifierRegex.test(hotkey)) {
    combokeys.bind(hotkey, (e) => {
      e.preventDefault();
      boundAction();
      startRipple();
      requestAnimationFrame(() =>
        requestAnimationFrame(endRipple)
      );
    }, 'keydown');
  } else {
    var rippled = false;
    combokeys.bind(hotkey, (e) => {
      if (!rippled) {
        startRipple();
        rippled = true;
      }
    }, 'keydown');
    combokeys.bind(hotkey, (e) => {
      boundAction();
      endRipple();
      rippled = false;
    }, 'keyup');
  }
}
