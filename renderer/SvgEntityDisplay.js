import React from 'react'

class Ball extends React.Component {
  render() {
    return (
      <circle cx={this.props.p.x} cy={this.props.p.y} r={this.props.r} fill='blue' />
    );
  }
}

class Wire extends React.Component {
  render() {
    return (
      <line
        x1={this.props.p.x}
        y1={this.props.p.y}
        x2={this.props.q.x}
        y2={this.props.q.y}
        stroke={'black'}
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
