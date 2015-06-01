'use strict';

var React = require('react/addons');

var MuiIconButton = require('material-ui').IconButton;
var FontIcon = require('material-ui').FontIcon;

var {Line, Curve, MultiLine, Viewfinder, CursorMove, OnionSkin} = require('./SvgIcons');

var IconButton = React.createClass({

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.icon !== nextProps.icon;
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
    var icon = this.getIcon(this.props.icon);
    if (icon) {
      return (
        <MuiIconButton {...this.props}>
          {icon}
        </MuiIconButton>
      );
    }
    return (
      <MuiIconButton {...this.props}>
        <FontIcon className={'mdi mdi-' + this.props.icon} />
      </MuiIconButton>
    );
  }

});

module.exports = IconButton;
