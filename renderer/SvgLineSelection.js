import React, {Component, PropTypes} from 'react'

const P_COLOR = '#FFEB3B'
const Q_COLOR = '#FF9800'
const LINE_COLOR = '#9C27B0'
const SELECTION_WIDTH = 10

export default class LineSelection extends Component {

  static get propTypes() {
    return {
      viewport: PropTypes.shape({
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        z: PropTypes.number.isRequired
      }).isRequired,
      lines: PropTypes.arrayOf(PropTypes.object).isRequired
    }
  }

  getArcs(id, p, q, vec, length, norm, dx, dy, z) {
    let d = {
      x: -dx,
      y: -dy
    }
    let width = SELECTION_WIDTH

    let offset = Math.sqrt(width * width - Math.pow(length * 0.5 / z, 2)) * z
    let middle = vec.clone().mulS(0.5).add(p)
    let a = norm.clone().mulS(offset).add(middle).mulS(1/z).add(d)
    let b = norm.clone().mulS(-offset).add(middle).mulS(1/z).add(d)

    return [
      <path key={-2 * id - 1}
        fill={P_COLOR}
        d={`M${a.x} ${a.y} A ${width} ${width} 0 1 1 ${b.x} ${b.y}`}
      />,
      <path key={-2 * id - 2}
        fill={Q_COLOR}
        d={`M${a.x} ${a.y} A ${width} ${width} 0 1 0 ${b.x} ${b.y}`}
      />
    ]
  }

  render() {
    let {x, y, z, w, h} = this.props.viewport
    let [dx, dy] = [x / z - w / 2, y / z - h / 2]
    let width = SELECTION_WIDTH
    return (
      <svg style={{position: 'absolute'}} viewBox={`0 0 ${w} ${h}`}>
        <g style={{opacity: 0.7}}>
          {this.props.lines.map(({id, x1, y1, x2, y2, length}) =>
              <line key={id}
                strokeWidth={width * 2}
                stroke={LINE_COLOR}
                x1={x1 / z - dx}
                y1={y1 / z - dy}
                x2={x2 / z - dx}
                y2={y2 / z - dy}
              />
          )}
          {this.props.lines.map(({id, p, q, vec, length, norm}) =>
            length * 0.5 / z < (SELECTION_WIDTH - 0.1) ?
              this.getArcs(id, p, q, vec, length, norm, dx, dy, z)
            : [
              <circle key={-2 * id - 1}
                fill={P_COLOR}
                r={width}
                cx={p.x / z - dx}
                cy={p.y / z - dy}
              />,
              <circle key={-2 * id - 2}
                fill={Q_COLOR}
                r={width}
                cx={q.x / z - dx}
                cy={q.y / z - dy}
              />
            ]).reduce((cs, c) => cs.concat(c), [])
          }
          {this.props.lines.map(({id, p, vec, length}) =>
            length * 0.5 / z < (SELECTION_WIDTH * 1.5) ?
              <circle key={id}
                fill={LINE_COLOR}
                r={width / 2}
                cx={(p.x + 0.5 * vec.x) / z - dx}
                cy={(p.y + 0.5 * vec.y) / z - dy}
              />
            : null)
          }
        </g>
      </svg>
    )
  }

}
