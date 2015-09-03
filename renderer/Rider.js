'use strict';

var React = require('react');
var Isvg = require('react-inlinesvg');
var getRiderCSS = require('./getRiderCSS');
import RiderInstance from './RiderInstance'

require('../assets/svg/boshSprite.svg');

var SvgSprite = React.createClass({
  shouldComponentUpdate() {
    return false;
  },

  render() {
    return (
      <g>
        <style dangerouslySetInnerHTML={{ __html: getRiderCSS(this.props.namespace, this.props.i, this.props.flag)}} />
        <foreignObject style={{display: 'none'}}>
          <Isvg src={this.props.src} uniquifyIDs={false} namespace={this.props.namespace}/>
        </foreignObject>
      </g>
    );
  }
});

// TODO: make Rider not rely on viewbox panning/scaling/outer svg
var Rider = React.createClass({

  shouldComponentUpdate(nextProps) {
    return this.props.frame !== nextProps.frame || this.props.seed !== nextProps.seed || this.props.rider !== nextProps.rider;
  },

  getDefaultProps() {
    return {
      riderSpriteSrc: '/svg/boshSprite.svg'
    };
  },

  render() {
    let {
      seed,
      frame,
      rider
    } = this.props
    let namespace = `__RIDER_SPRITE_${this.props.i}__`;

    return (
      <g id={namespace} fillOpacity="0.5" strokeOpacity="0.5">
        <SvgSprite namespace={namespace} i={this.props.i} src={this.props.riderSpriteSrc} flag={this.props.flag}/>
        <RiderInstance key={this.props.frame} namespace={namespace} {...{seed, frame, rider}} />
      </g>
    );
  }
});

module.exports = Rider;
