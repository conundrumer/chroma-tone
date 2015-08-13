/* eslint no-underscore-dangle: 0*/
'use strict';

var React = require('react');

var MuiIconButton = require('material-ui').IconButton;

var IconButton = React.createClass({

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  getInitialState() {
    return {
      keyPressed: false
    };
  },

  componentWillMount() {
    this.bindHotkey(this.props.hotkey);
  },

  shouldComponentUpdate(nextProps, nextState) {
    let {
      style,
      tooltip,
      selected,
      disabled
    } = this.props;

    let {
      style: style_,
      tooltip: tooltip_,
      selected: selected_,
      disabled: disabled_
    } = nextProps;

    return style !== style_
      || tooltip !== tooltip_
      || selected !== selected_
      || disabled !== disabled_;
  },

  componentWillUpdate(nextProps, nextState) {
    if (this.props.hotkey !== nextProps.hotkey) {
      this.unbindHotkey();
      this.bindHotkey(nextProps.hotkey);
    }

    if (!this.state.disabled && !nextState.disabled && !this.state.keyPressed && nextState.keyPressed) {
      this.startRipple();
    }

    if (this.state.keyPressed && !nextState.keyPressed) {
      this.endRipple();
      if (!this.state.disabled && !nextState.disabled) {
        this.props.onTouchTap();
      }
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

  onHotkeyDown(e) {
    if (this.isMounted()) {
      if (this.props.hotkey.includes('mod')) {
        this.setState({ keyPressed: true }, () => this.setState({ keyPressed: false }));
      } else {
        this.setState({ keyPressed: true });
      }
    }
    return false;
  },

  onHotkeyUp() {
    if (this.isMounted()) {
      this.setState({ keyPressed: false });
    }
    return false;
  },

  // lol
  startRipple() {
    this.refs.iconButton.refs.button.refs.touchRipple.start();
  },

  endRipple() {
    this.refs.iconButton.refs.button.refs.touchRipple.end();
  },

  getColor() {
    let {
      primary1Color,
      // primary2Color,
      // primary3Color,
      textColor,
      disabledColor
    } = this.context.muiTheme.palette;
    return this.props.disabled ? disabledColor : (this.props.selected && (this.props.selectedColor || primary1Color) || textColor);
  },

  render() {
    var className = 'icon-button';

    return (
      <MuiIconButton {...this.props} className={className} ref='iconButton' onTouchTap={this.props.onTouchTap || () => {}}>
        <this.props.children color={this.getColor()} disabled={this.props.disabled}/>
      </MuiIconButton>
    );
  }

});

module.exports = IconButton;
