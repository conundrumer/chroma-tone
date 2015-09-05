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

const OPACITY_DECAY = 1.2
const OPACITY_INIT = 0.5
const OPACITY_MIN = 0.05

// TODO: make Rider not rely on viewbox panning/scaling/outer svg
var Rider = React.createClass({

  getDefaultProps() {
    return {
      riderSpriteSrc: 'svg/boshSprite.svg'
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

    let getOpacity = (i) => {
      if (startIndex !== index) {
        i = index - (i + startIndex)
      }
      return OPACITY_INIT * (1 - OPACITY_MIN) * Math.pow(OPACITY_DECAY, -i) + OPACITY_MIN
    }

    return (
      <g id={namespace}>
        <SvgSprite namespace={namespace} i={this.props.i} src={this.props.riderSpriteSrc} flag={this.props.flag}/>
        {
          onionSkin ?
            riders.map((state, i) =>
              startIndex + i === index ? null :
              <g key={startIndex + i} style={{opacity: getOpacity(i)}}>
                <RiderInstance
                  namespace={namespace}
                  i={startIndex + i}
                  {...{seed, index: startIndex + i, rider: state}}
                />
              </g>
            )
          : null
        }
        <RiderInstance i={-1} key={index} namespace={namespace} {...{seed, index, rider}}/>
      </g>
    );
  }
});

module.exports = Rider;
