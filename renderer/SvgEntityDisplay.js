import React from 'react'
import color from 'onecolor'

class Ball extends React.Component {
  render() {
    return (
      <circle cx={this.props.p.x} cy={this.props.p.y} r={this.props.r} fill='white' strokeWidth={1} stroke='black' />
    );
  }
}

class Wire extends React.Component {
  render() {
    let length = this.props.p.distance(this.props.q)
    return (
      <line
        x1={this.props.p.x}
        y1={this.props.p.y}
        x2={this.props.q.x}
        y2={this.props.q.y}
        stroke={color(`hsv(${360 * (Math.log2(length) % 1)}, 100%, 90%)`).hex()}
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
          this.props.wires.map(wire =>
            <Wire key={wire.id} {...wire} />
          )
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
