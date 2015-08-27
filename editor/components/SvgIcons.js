'use strict';

var React = require('react/addons');
var {SvgIcon} = require('material-ui');
var Eject = require('icons/eject');
var Label = require('icons/label');
var LabelOutline = require('icons/label-outline');

var PureRenderMixin = React.addons.PureRenderMixin;

var Line = React.createClass({
  displayName: 'Line',

  mixins: [PureRenderMixin],

  render() {
    let {color, ...props} = this.props;
    return (
      <SvgIcon {...props}>
        <line stroke={color} strokeWidth="3" strokeLinecap="round" x1="20" y1="4" x2="4" y2="20"/>
      </SvgIcon>
    );
  }

});

var Curve = React.createClass({
  displayName: 'Curve',

  mixins: [PureRenderMixin],

  render() {
    let {color, ...props} = this.props;
    return (
      <SvgIcon {...props}>
        <path fill="none" stroke={color} strokeWidth="2.75" strokeLinecap="round" d="M20,4C7.3,6,19,17,4,20"/>
      </SvgIcon>
    );
  }

});

var MultiLine = React.createClass({
  displayName: 'MultiLine',

  mixins: [PureRenderMixin],

  render() {
    let {color, ...props} = this.props;
    return (
      <SvgIcon {...props}>
        <line stroke={color} strokeWidth="2.5" strokeLinecap="round" x1="8" y1="10" x2="20" y2="4"/>
        <line stroke={color} strokeWidth="2.5" strokeLinecap="round" x1="6" y1="15" x2="17" y2="11"/>
        <line stroke={color} strokeWidth="2.5" strokeLinecap="round" x1="4" y1="20" x2="14" y2="18"/>
      </SvgIcon>
    );
  }

});

var Viewfinder = React.createClass({
  displayName: 'Viewfinder',

  mixins: [PureRenderMixin],

  render() {
    let {color, ...props} = this.props;
    return (
      <SvgIcon {...props}>
        <path fill="none" stroke={color} strokeWidth="2.22" strokeLinecap="round" d="M3.1,9.3c7.9,9,8.7,0.6,17.8,3.2"/>
        <path fill={color} d="M19.8,17.6H4.2V6.4h15.6 M19.8,4.2H4.2C3,4.2,2,5.2,2,6.4v11.1c0,1.2,1,2.2,2.2,2.2h15.6c1.2,0,2.2-1,2.2-2.2V6.4,C22,5.2,21,4.2,19.8,4.2z"/>
      </SvgIcon>
    );
  }

});

var CursorMove = React.createClass({
  displayName: 'CursorMove',

  mixins: [PureRenderMixin],

  render() {
    return (
      <SvgIcon {...this.props}>
        <path d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z" />
      </SvgIcon>
    );
  }

});

var OnionSkin = React.createClass({
  displayName: 'OnionSkin',

  mixins: [PureRenderMixin],

  render() {
    return (
      <SvgIcon {...this.props}>
        <path d="M4.2,8.7V6.4H2v2.2 M17.6,4.2c0-1.2-1-2.2-2.2-2.2v2.2 M8.7,4.2V2H6.4v2.2 M13.1,4.2V2h-2.2v2.2 M17.6,15.3h-2.2v2.2,C16.6,17.6,17.6,16.6,17.6,15.3 M2,10.9v2.2h2.2v-2.2 M2,4.2h2.2V2C3,2,2,3,2,4.2 M15.3,10.9v2.2h2.2v-2.2 M2,15.3,c0,1.2,1,2.2,2.2,2.2v-2.2 M10.9,15.3v2.2h2.2v-2.2"/>
        <path d="M8.7,19.8V8.7h11.1v11.1 M22,19.8V8.7c0-1.2-1-2.2-2.2-2.2H8.7c-1.2,0-2.2,1-2.2,2.2v5.6v4.4v1.1c0,1.2,1,2.2,2.2,2.2h11.1,C21,22,22,21,22,19.8"/>
      </SvgIcon>
    );
  }

});

var SlowMotion = React.createClass({
  displayName: 'SlowMotion',

  mixins: [PureRenderMixin],

  render() {
    return (
      <Eject {...this.props} style={{transform: 'rotate(90deg)'}} />
    );
  }
});

var FlagRaw = React.createClass({
  displayName: 'FlagRaw',

  mixins: [PureRenderMixin],

  render() {
    let {color} = this.props;
    return (
      <g transform='translate(-6 -21)' >
        <path fill={color} d='M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3Z' />
      </g>
    );
  }
});

var StartFlagRaw = React.createClass({
  displayName: 'StartFlagRaw',

  mixins: [PureRenderMixin],

  render() {
    let {color} = this.props;
    return (
      <g transform='translate(-6 -21)' >
        <path fill={color} d='M6,3A1,1 0 0,1 7,4V4.88C8.06,4.44 9.5,4 11,4C14,4 14,6 16,6C19,6 20,4 20,4V12C20,12 19,14 16,14C13,14 13,12 11,12C8,12 7,14 7,14V21H5V4A1,1 0 0,1 6,3M7,7.25V11.5C7,11.5 9,10 11,10C13,10 14,12 16,12C18,12 18,11 18,11V7.5C18,7.5 17,8 16,8C14,8 13,6 11,6C9,6 7,7.25 7,7.25Z' />
      </g>
    );
  }
});

var Flag = React.createClass({
  displayName: 'Flag',

  mixins: [PureRenderMixin],

  render() {
    let {color, ...props} = this.props;
    return (
      <SvgIcon {...this.props}>
        <g transform='translate(1 24)'>
          <FlagRaw color={color} />
        </g>
      </SvgIcon>
    );
  }
});

var StartFlag = React.createClass({
  displayName: 'StartFlag',

  mixins: [PureRenderMixin],

  render() {
    let {color, ...props} = this.props;
    return (
      <SvgIcon {...this.props}>
        <g transform='translate(1 24)'>
          <StartFlagRaw color={color} />
        </g>
      </SvgIcon>
    );
  }
});

var TimelineCursor = React.createClass({
  displayName: 'TimelineCursor',

  mixins: [PureRenderMixin],

  render() {
    let {color, ...props} = this.props;
    return (
      <Label {...this.props} style={{transform: 'rotate(-90deg)'}} />
    );
  }
})
var TimelineCursorOutline = React.createClass({
  displayName: 'TimelineCursorOutline',

  mixins: [PureRenderMixin],

  render() {
    let {color, ...props} = this.props;
    return (
      <LabelOutline {...this.props} style={{transform: 'rotate(-90deg)'}} />
    );
  }
})

module.exports = {Line, Curve, MultiLine, Viewfinder, CursorMove, OnionSkin, SlowMotion, FlagRaw, StartFlagRaw, Flag, StartFlag, TimelineCursor, TimelineCursorOutline};
