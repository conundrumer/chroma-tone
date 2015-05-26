'use strict';

var React = require('react/addons');
var {SvgIcon} = require('material-ui');

var Line = React.createClass({

  render() {
    return (
      <SvgIcon>
        <line stroke="black" strokeWidth="3" strokeLinecap="round" x1="20" y1="4" x2="4" y2="20"/>
      </SvgIcon>
    );
  }

});

var Curve = React.createClass({

  render() {
    return (
      <SvgIcon>
        <path fill="none" stroke="black" strokeWidth="2.75" strokeLinecap="round" d="M20,4C7.3,6,19,17,4,20"/>
      </SvgIcon>
    );
  }

});

var MultiLine = React.createClass({

  render() {
    return (
      <SvgIcon>
        <line stroke="black" strokeWidth="2.5" strokeLinecap="round" x1="8" y1="10" x2="20" y2="4"/>
        <line stroke="black" strokeWidth="2.5" strokeLinecap="round" x1="6" y1="15" x2="17" y2="11"/>
        <line stroke="black" strokeWidth="2.5" strokeLinecap="round" x1="4" y1="20" x2="14" y2="18"/>
      </SvgIcon>
    );
  }

});

var Viewfinder = React.createClass({

  render() {
    return (
      <SvgIcon>
        <path fill="none" stroke="black" strokeWidth="2.22" strokeLinecap="round" d="M3.1,9.3c7.9,9,8.7,0.6,17.8,3.2"/>
        <path d="M19.8,17.6H4.2V6.4h15.6 M19.8,4.2H4.2C3,4.2,2,5.2,2,6.4v11.1c0,1.2,1,2.2,2.2,2.2h15.6c1.2,0,2.2-1,2.2-2.2V6.4,C22,5.2,21,4.2,19.8,4.2z"/>
      </SvgIcon>
    );
  }

});

var CursorMove = React.createClass({

  render() {
    return (
      <SvgIcon>
        <path fill="black" d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z" />
      </SvgIcon>
    );
  }

});

var OnionSkin = React.createClass({

  render() {
    return (
      <SvgIcon>
        <path fill="black" d="M4.2,8.7V6.4H2v2.2 M17.6,4.2c0-1.2-1-2.2-2.2-2.2v2.2 M8.7,4.2V2H6.4v2.2 M13.1,4.2V2h-2.2v2.2 M17.6,15.3h-2.2v2.2,C16.6,17.6,17.6,16.6,17.6,15.3 M2,10.9v2.2h2.2v-2.2 M2,4.2h2.2V2C3,2,2,3,2,4.2 M15.3,10.9v2.2h2.2v-2.2 M2,15.3,c0,1.2,1,2.2,2.2,2.2v-2.2 M10.9,15.3v2.2h2.2v-2.2"/>
        <path fill="black" d="M8.7,19.8V8.7h11.1v11.1 M22,19.8V8.7c0-1.2-1-2.2-2.2-2.2H8.7c-1.2,0-2.2,1-2.2,2.2v5.6v4.4v1.1c0,1.2,1,2.2,2.2,2.2h11.1,C21,22,22,21,22,19.8"/>
      </SvgIcon>
    );
  }

});

module.exports = {Line, Curve, MultiLine, Viewfinder, CursorMove, OnionSkin};
