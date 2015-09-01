/* eslint no-underscore-dangle: 0*/
'use strict';

var React = require('react');

var MuiIconButton = require('material-ui').IconButton;

var IconButton = React.createClass({

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  shouldComponentUpdate(nextProps, nextState) {
    let {
      style,
      tooltip,
      selected,
      disabled,
      transform
    } = this.props;

    let {
      style: style_,
      tooltip: tooltip_,
      selected: selected_,
      disabled: disabled_,
      transform: transform_
    } = nextProps;

    return style !== style_
      || tooltip !== tooltip_
      || selected !== selected_
      || disabled !== disabled_
      || transform !== transform_;
  },

  componentDidMount() {
    this.props.setRipple(this.startRipple, this.endRipple);
  },

  // lol
  startRipple() {
    if (this.props.disabled) {
      return;
    }
    this.refs.iconButton.refs.button.refs.touchRipple.start();
  },

  endRipple() {
    if (this.props.disabled) {
      return;
    }
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
    let {
      onTouchTap,
      onPress,
      onRelease,
      style,
      tooltip,
      disabled,
      transform,
      tooltipPosition
    } = this.props;
    let iconStyle = null;
    if (transform) {
      iconStyle = { transform: transform };
    }
    let pressHandlers = {
      onMouseDown: onPress,
      onTouchStart: onPress,
      onMouseUp: onRelease,
      onMouseLeave: onRelease,
      onTouchEnd: onRelease,
      onTouchCancel: onRelease
    }
    return (
      <MuiIconButton {...{
        onTouchTap,
        style,
        tooltip,
        disabled,
        tooltipPosition
      }}
        {...pressHandlers}
        className='icon-button'
        ref='iconButton'
        iconStyle={iconStyle}
      >
        <this.props.children color={this.getColor()} disabled={this.props.disabled}/>
      </MuiIconButton>
    );
  }

});

module.exports = IconButton;
