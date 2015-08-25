import React from 'react'

export default class Flag extends React.Component {
  render() {
    let {icon, pos: {x, y}, zoom} = this.props
    return (
      <g transform={`translate(${x} ${y})`}>
        {icon}
      </g>
    );
  }
}
