import React from 'react'
import chroma from 'chroma-js'

class Ball extends React.Component {
  render() {
    return (
      <circle cx={this.props.p.x} cy={this.props.p.y} r={this.props.r * (this.props.size || 1)} fill={this.props.color || 'white'} strokeWidth={1} stroke='black' />
    );
  }
}

function getColorFromLine(p, q, t) {
  let length = p.distance(q)
  return chroma.hcl(360 * (Math.log2(length) % 1), t === 1 ? 85 : 40, t === 1 ? 85 : 60 * t)
}

class Wire extends React.Component {
  render() {
    return (
      <line
        x1={this.props.p.x}
        y1={this.props.p.y}
        x2={this.props.q.x}
        y2={this.props.q.y}
        stroke={getColorFromLine(this.props.p, this.props.q, this.props.t)}
        strokeWidth={2 * this.props.r}
        strokeLinecap='round'
      />
    );
  }
}

export default class SvgEntityDisplay extends React.Component {
  render() {
    return (
      <g>
        {
          this.props.initBalls.map(ball =>
            <Ball key={ball.id} {...ball} color='grey' />
          )
        }
        {
          this.props.wires.map(wire =>
            <Wire key={wire.id} {...wire} />
          )
        }
        {
          this.props.collisions.map(({entities: [ball, wire], force}) => {
            return force < 0.2 ? null : <Ball key={-ball.id} {...ball} color={getColorFromLine(wire.p, wire.q, wire.t)} size={1 + Math.log(1 + force)}/>
          })
        }
        {
          this.props.balls.map(ball =>
            <Ball key={ball.id} {...ball} />
          )
        }
      </g>
    );
  }

}
