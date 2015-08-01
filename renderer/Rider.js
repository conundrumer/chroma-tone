'use strict';

var React = require('react');
var Isvg = require('react-inlinesvg');
var getRiderCSS = require('./getRiderCSS');

require('../assets/svg/boshSprite.svg');
var { Constraints: { STRING_LHAND, STRING_RHAND }, Scarf: { p: scarfBase } } = require('../core/riders/RiderBody');

const BLINK_LENGTH = 8;
const BLINK_DENSITY = 0.01 * BLINK_LENGTH;
const PHI = (Math.sqrt(5) - 1) / 2;
const PRECISION = 1000;
const scarfColors = [
  'white',
  'white',
  '#F44336',
  'white',
  '#8BC34A',
  'white',
  '#2196F3'
];

function getTransform(part) {
  return `rotate(${part.angle} ${part.x} ${part.y}) translate(${part.x} ${part.y})`;
}

function getFacePath(t) {
  let u = Math.max(t > 1 ? 2 - t : t, 0);
  let v = -Math.min(t < -1 ? -2 - t : t, 0);
  return [
    'M', 10.1, -2.4,
    'c', -1.9 * v - 3.1 * (1 - v), -1.2 * v, -3.0 * v - 3.1 * (1 - v), -1.3 * v, -3.1, 0,
    'v', 4.9,
    'c', 0.1 * u, 1.3 * u, 1.2 * u, 1.2 * u, 3.1, 0,
    'z'
  ];
}

var Constraint = React.createClass({

  render() {
    let { points, constraint } = this.props;
    let p = points[constraint.p.id];
    let q = points[constraint.q.id];
    return (
      <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={this.props.color} strokeWidth={this.props.width || 0.3} />
    );
  }

});

var ScarfSegment = React.createClass({

  render() {
    let { i, rider: { points, scarfPoints } } = this.props;
    let p = i > 0 ? scarfPoints[i - 1] : points[scarfBase.id];
    let q = scarfPoints[i];
    return (
      <line x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={this.props.color} strokeWidth={this.props.width} />
    );
  }

});

var SledString = React.createClass({

  render() {
    return (
      this.props.rider.crashed ? null : <Constraint {...this.props} points={this.props.rider.points} color="black"/>
    );
  }

});

var XLink = React.createClass({
  shouldComponentUpdate() {
    return false;
  },

  render() {
    let {href, useParams = ''} = this.props;
    return (
      <g dangerouslySetInnerHTML={{ __html: `<use ${useParams} xlink:href="${href}"/>`}} />
    );
  }

});

var TransformLink = React.createClass({
  render() {
    return (
      <g transform={this.props.transform}>
        <XLink href={this.props.href} />
      </g>
    );
  }
});

var SvgSprite = React.createClass({
  shouldComponentUpdate() {
    return false;
  },

  render() {
    return (
      <g>
        <style dangerouslySetInnerHTML={{ __html: getRiderCSS(this.props.namespace, this.props.i)}} />
        <foreignObject style={{display: 'none'}}>
          <Isvg src={this.props.src} uniquifyIDs={false} namespace={this.props.namespace}/>
        </foreignObject>
      </g>
    );
  }
});

var Rider = React.createClass({

  getDefaultProps() {
    return {
      riderSpriteSrc: '/svg/boshSprite.svg'
    };
  },

  getBlink() {
    return this.props.frameIndex > 0 && ((this.props.seed + PHI * (this.props.frameIndex / BLINK_LENGTH << 0)) % 1) < BLINK_DENSITY;
  },

  getHeadRotation() {
    let t = Math.pow(2, -this.props.rider.crashed / 10);
    t = ((0.5 + (t * PRECISION)) << 0) / PRECISION;
    t = t % 4;
    t = t > 2 ? t - 4 : t < -2 ? t + 4 : t;
    return t;
  },

  render() {
    let {
      sled,
      body,
      rightArm,
      leftArm,
      rightLeg,
      leftLeg
    } = this.props.rider.getBodyParts(PRECISION);

    let blink = this.getBlink();
    let t = this.getHeadRotation();
    let yPos = -2.6 * (1 - t);

    let facePath = getFacePath(t).join(' ');

    let namespace = `__RIDER_SPRITE_${this.props.i}__`;
    let faceOutlineID = namespace + 'face-outline';
    let faceClipID = namespace + 'face-clip';
    let faceContentsID = namespace + 'face-contents' + (blink ? '-eyes-closed' : '');

    return (
      <g id={namespace} >
        <SvgSprite namespace={namespace} i={this.props.i} src={this.props.riderSpriteSrc} />
        {
          this.props.rider.scarfPoints.map( (point, i) =>
            // <ScarfSegment key={i} i={i} rider={this.props.rider} width={2} color={ (i % 2) === 0 ? '#d20202' : 'white'}/>
            <ScarfSegment key={i} i={i} rider={this.props.rider} width={2} color={ scarfColors[i]}/>
          )
        }
        {
          this.props.rider.sledBroken ?
            <TransformLink transform={getTransform(sled)} href={'#' + namespace + 'sled-broke'} />
          : <TransformLink transform={getTransform(sled)} href={'#' + namespace + 'sled'} />
        }
        <TransformLink transform={getTransform(leftLeg)} href={'#' + namespace + 'leg'} />
        <SledString rider={this.props.rider} constraint={STRING_LHAND} />
        <TransformLink transform={getTransform(leftArm)} href={'#' + namespace + 'arm'} />
        <TransformLink transform={getTransform(rightLeg)} href={'#' + namespace + 'leg'} />
        <g transform={getTransform(body)}>
          <g className="face">
            <defs>
              <clipPath id={faceClipID}>
                <path id={faceOutlineID} d={facePath}/>
              </clipPath>
            </defs>
            <g clipPath={`url(#${faceClipID})`}>
              <TransformLink transform={`translate(0 ${yPos})`} href={`#${faceContentsID}`} />
            </g>
            <path fill="none" className="outline" d={facePath}/>
          </g>
          <XLink href={'#' + namespace + 'body'} />
        </g>
        <SledString rider={this.props.rider} constraint={STRING_RHAND} />
        <TransformLink transform={getTransform(rightArm)} href={'#' + namespace + 'arm'} />
      </g>
    );
  }
});

module.exports = Rider;
