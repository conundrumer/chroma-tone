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
    return this.props.index !== nextProps.index || this.props.flagIndex !== nextProps.flagIndex || this.props.seed !== nextProps.seed || this.props.rider !== nextProps.rider;
  },

  getDefaultProps() {
    return {
      riderSpriteSrc: '/svg/boshSprite.svg'
    };
  },

  render() {
    let {
      seed,
      index,
      startIndex,
      rider,
      riders,
      onionSkin
    } = this.props
    let namespace = `__RIDER_SPRITE_${this.props.i}__`;

    let opacity = 1 / riders.length * 0.9 + 0.1

    return (
      <g id={namespace}>
        <SvgSprite namespace={namespace} i={this.props.i} src={this.props.riderSpriteSrc} flag={this.props.flag}/>
        {
          onionSkin ?
            riders.map((state, i) =>
              <g key={startIndex + i} fillOpacity={opacity} strokeOpacity={opacity}>
                <RiderInstance
                  namespace={namespace}
                  opacity={0.5}
                  {...{seed, index: startIndex + i, rider: state}}
                />
              </g>
            )
          : <RiderInstance key={index} namespace={namespace} {...{seed, index, rider}}/>
        }
      </g>
    );
  }
});

module.exports = Rider;
