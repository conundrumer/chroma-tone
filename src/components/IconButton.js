/* eslint no-underscore-dangle: 0*/
'use strict';

var React = require('react/addons');
var Transitions = require('material-ui/lib/styles/transitions');

var MuiIconButton = require('material-ui').IconButton;
var FontIcon = require('material-ui').FontIcon;

var {Line, Curve, MultiLine, Viewfinder, CursorMove, OnionSkin} = require('./SvgIcons');

var IconButton = React.createClass({

  getDefaultProps() {
    return {
      style: {}
    };
  },

  getInitialState() {
    return {
      keyPressed: false
    };
  },

  componentWillMount() {
    this.bindHotkey(this.props.hotkey);
  },

  componentDidMount() {
    // lol
    this.oldGetIconButtonStyles = this.refs.iconButton.getStyles;
    this.refs.iconButton.getStyles = this.getIconButtonStyles;
    // if (this.props.tooltip) {
      this.oldGetTooltipStyles = this.refs.iconButton.refs.tooltip.getStyles;
      this.refs.iconButton.refs.tooltip.getStyles = this.getTooltipStyles;
    // }
    this._positionTooltip();
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.icon !== nextProps.icon ||
      this.props.hotkey !== nextProps.hotkey ||
      this.state.keyPressed !== nextState.keyPressed ||
      this.props.selected !== nextProps.selected ||
      this.props.tooltip !== nextProps.tooltip ||
      !this.props.showTooltip && nextProps.showTooltip ||
      !!this.props.iconStyle && !!nextProps.iconStyle &&
        this.props.iconStyle.transform !== nextProps.iconStyle.transform;
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

    if (this.props.tooltip !== nextProps.tooltip) {
      this._positionTooltip();
    }
  },

  componentWillUnmount() {
    // don't unbind since you can only bind one function at a time
    // TODO: fix opening and closing rapidly causing stuff to not get binded
    // if (this.unbindHotkey) {
    //   this.unbindHotkey();
    // }
  },

  getIconButtonStyles() {
    var styles = this.oldGetIconButtonStyles();
    var margin = (this.props.style.width || 48) + 4;
    styles.tooltip.marginTop = margin;
    if (this.props.upwardsTooltip) {
      styles.tooltip.marginTop = 0;
      styles.tooltip.marginBottom = margin;
    }
    if (!this.props.showTooltip) {
      styles.tooltip.display = 'none';
    }
    return styles;
  },

  getTooltipStyles() {
    var styles = this.oldGetTooltipStyles();
    if (this.props.upwardsTooltip) {
      styles.root.bottom = styles.root.top;
      styles.root.top = '';
      styles.root.transition += ',' + Transitions.easeOut('0ms', 'bottom', '450ms');
      styles.ripple.bottom = styles.ripple.top;
      styles.ripple.top = '';
      styles.ripple.transform = 'translate(-50%, 50%)';
      styles.rootWhenShown.bottom = styles.rootWhenShown.top;
      styles.rootWhenShown.top = '';
      styles.rootWhenShown.transform = 'translate3d(0px, -16px, 0px)';
      styles.rootWhenShown.transition += ',' + Transitions.easeOut('0ms', 'bottom', '0ms');
    }
    return styles;
  },

  _positionTooltip: function() {
    var tooltip = React.findDOMNode(this.refs.iconButton.refs.tooltip);
    var tooltipWidth = tooltip.offsetWidth;
    var buttonWidth = this.props.style.width || 48;

    tooltip.style.left = (tooltipWidth - buttonWidth) / 2 * -1 + 'px';
    this.setState({});
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
    var style = this.props.style;
    style.background = 'null';
    style.transition = '0';
    var className = 'icon-button' + (this.props.selected ? ' selected ' + (this.props.selectedColor || 'blue') : '');
    var icon = this.getIcon(this.props.icon);

    return (
      <MuiIconButton className={className} ref='iconButton' {...this.props} style={style}>
        {
          icon ? icon :
          <FontIcon className={'mdi mdi-' + this.props.icon} style={this.props.iconStyle} />
        }
      </MuiIconButton>
    );
  }

});

module.exports = IconButton;
