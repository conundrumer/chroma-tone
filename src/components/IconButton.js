'use strict';

var React = require('react/addons');

var MuiIconButton = require('material-ui').IconButton;
var FontIcon = require('material-ui').FontIcon;

var {Line, Curve, MultiLine, Viewfinder, CursorMove, OnionSkin} = require('./SvgIcons');

var IconButton = React.createClass({

  getInitialState() {
    return {
      keyPressed: false
    };
  },

  componentWillMount() {
    this.bindHotkey(this.props.hotkey);
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.icon !== nextProps.icon ||
      this.props.hotkey !== nextProps.hotkey ||
      this.state.keyPressed !== nextState.keyPressed ||
      this.props.selected !== nextProps.selected ||
      !!this.props.style && !!nextProps.style && this.props.style.transform !== nextProps.style.transform;
  },

  componentWillUpdate(nextProps, nextState) {
    if (this.props.hotkey !== nextProps.hotkey) {
      this.unbindHotkey();
      this.bindHotkey(nextProps.hotkey);
    }

    if (!this.state.keyPressed && nextState.keyPressed) {
      this.startRipple();
    }

    if (this.state.keyPressed && !nextState.keyPressed) {
      this.endRipple();
      this.props.onTouchTap();
    }
  },

  componentWillUnmount() {
    // don't unbind since you can only bind one function at a time
    // TODO: fix opening and closing rapidly causing stuff to not get binded
    // if (this.unbindHotkey) {
    //   this.unbindHotkey();
    // }
  },

  bindHotkey(hotkey) {
    if (!hotkey) {
      return;
    }
    var combokeys = this.props.combokeys;
    combokeys.bind(hotkey, this.onHotkeyDown, 'keydown');
    combokeys.bind(hotkey, this.onHotkeyUp, 'keyup');

    // this.unbindHotkey = () => {
    //   combokeys.unbind(hotkey, 'keydown');
    //   combokeys.unbind(hotkey, 'keyup');
    // };
  },

  onHotkeyDown() {
    if (this.isMounted()) {
      this.setState({ keyPressed: true });
    }
  },

  onHotkeyUp() {
    if (this.isMounted()) {
      this.setState({ keyPressed: false });
    }
  },

  // lol
  startRipple() {
    this.refs.iconButton.refs.button.refs.touchRipple.start();
  },

  endRipple() {
    this.refs.iconButton.refs.button.refs.touchRipple.end();
  },

  getIcon(icon) {
    switch (icon) {
      case 'line':
        return <Line />;
      case 'curve':
        return <Curve />;
      case 'multi-line':
        return <MultiLine />;
      case 'viewfinder':
        return <Viewfinder />;
      case 'cursor-move':
        return <CursorMove />;
      case 'onion-skin':
        return <OnionSkin />;
    }
    return null;
  },

  render() {
    var style = this.props.style || {};
    style.background = 'null';
    style.transition = '0';
    var className = 'icon-button' + (this.props.selected ? ' selected blue' : '');
    var icon = this.getIcon(this.props.icon);
    // var selectRing = <div className={'select-ring' + (this.props.selected ? ' selected' : '')} />;
    if (icon) {
      return (
        <MuiIconButton className={className} ref='iconButton' {...this.props} style={style}>
          {icon}
        </MuiIconButton>
      );
    }
    return (
      <MuiIconButton className={className} ref='iconButton' {...this.props} style={style}>
        <FontIcon className={'mdi mdi-' + this.props.icon} />
      </MuiIconButton>
    );
  }

});

module.exports = IconButton;
