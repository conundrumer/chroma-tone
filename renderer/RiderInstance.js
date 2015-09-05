'use strict';

var React = require('react');
import { PureRenderMixin } from 'react'

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
  '#4CAF50',
  'white',
  '#2196F3'
];

function getScarfColor(flag, i) {
  return flag && scarfColors[i] !== 'white' ? 'grey' : scarfColors[i];
}

function round(x) {
  return ((x * PRECISION + 0.5) | 0) / PRECISION;
}

function getTransform(part) {
  let {x, y, angle} = part;
  x = round(x);
  y = round(y);
  angle = round(angle / Math.PI * 180);
  return `rotate(${angle} ${x} ${y}) translate(${x} ${y})`;
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

var Line = React.createClass({

  render() {
    let {p, q, color, width = 0.3} = this.props;
    return (
      <line x1={round(p.x)} y1={round(p.y)} x2={round(q.x)} y2={round(q.y)} stroke={color} strokeWidth={width} />
    );
  }
});

var Constraint = React.createClass({

  render() {
    let { points, constraint } = this.props;
    let {pos: p} = points[constraint.p.id];
    let {pos: q} = points[constraint.q.id];
    return <Line {...this.props} p={p} q={q} />;
  }

});

var ScarfSegment = React.createClass({

  render() {
    let { i, rider: { points, scarfPoints } } = this.props;
    let {pos: p} = i > 0 ? scarfPoints[i - 1] : points[scarfBase.id];
    let {pos: q} = scarfPoints[i];
    return <Line {...this.props} p={p} q={q} />;
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

// TODO: make Rider not rely on viewbox panning/scaling/outer svg
var Rider = React.createClass({

  shouldComponentUpdate(nextProps) {
    return this.props.index !== nextProps.index
      || this.props.seed !== nextProps.seed
      || this.props.rider !== nextProps.rider
  },

  getBlink() {
    return this.props.index > 0 && ((this.props.seed + PHI * (this.props.index / BLINK_LENGTH << 0)) % 1) < BLINK_DENSITY;
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
    } = this.props.rider.bodyParts;

    let blink = this.getBlink();
    let t = this.getHeadRotation();
    let yPos = -2.6 * (1 - t);

    let facePath = getFacePath(t).join(' ');

    let namespace = this.props.namespace;
    let faceOutlineID = namespace + 'face-outline_' + this.props.i
    let faceClipID = namespace + 'face-clip_' + this.props.i
    let faceContentsID = namespace + 'face-contents' + (blink ? '-eyes-closed' : '');

    return (
      <g>
        {
          this.props.rider.scarfPoints.map( (point, i) =>
            // <ScarfSegment key={i} i={i} rider={this.props.rider} width={2} color={ (i % 2) === 0 ? '#d20202' : 'white'}/>
            <ScarfSegment key={i} i={i} rider={this.props.rider} width={2} color={ getScarfColor(this.props.flag, i)}/>
          )
        }
        {
          this.props.rider.sledBroken ?
            <TransformLink key={1} transform={getTransform(sled)} href={'#' + namespace + 'sled-broke'} />
          : <TransformLink key={0} transform={getTransform(sled)} href={'#' + namespace + 'sled'} />
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
