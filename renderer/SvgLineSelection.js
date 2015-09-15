import React, {Component, PropTypes} from 'react'

const P_COLOR = '#FFEB3B'
const Q_COLOR = '#FF9800'
const LINE_COLOR = '#c0c0c0'
const SELECTION_RADIUS = 10

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

  getArcs(id, p, q, length, norm, dx, dy, z) {
    if (p === q) return []
    let d = {
      x: -dx,
      y: -dy
    }
    let width = SELECTION_RADIUS

    let offset = Math.sqrt(width * width - Math.pow(length * 0.5 / z, 2)) * z
    let middle = p.clone().add(q).mulS(0.5)
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
    let width = SELECTION_RADIUS
    let lines = this.props.lines.map(line => {
      return {...line,
        q: line.q || line.p
      }
    })
    return (
      <svg style={{position: 'absolute'}} viewBox={`0 0 ${w} ${h}`}>
        <g style={{opacity: 0.5}}>
          {lines.map(({id, p, q}) =>
              <line key={id}
                strokeWidth={width * 2}
                stroke={LINE_COLOR}
                x1={p.x / z - dx}
                y1={p.y / z - dy}
                x2={q.x / z - dx}
                y2={q.y / z - dy}
              />
          )}
          {lines.map(({id, p, q}) => {
            let length = p.distance(q)
            let vec = q.clone().subtract(p)
            let norm = vec.rotateRight().unit()
            return (length * 0.5 / z < (SELECTION_RADIUS - 0.1) ?
              this.getArcs(id, p, q, length, norm, dx, dy, z)
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
            })
          }
          {lines.map(({id, p, q}) => {
            return (p.distance(q) * 0.5 / z < (SELECTION_RADIUS * 1.5) ?
              <circle key={id}
                fill={LINE_COLOR}
                r={width / 2}
                cx={(0.5 * p.x + 0.5 * q.x) / z - dx}
                cy={(0.5 * p.y + 0.5 * q.y) / z - dy}
              />
            : null)
          })
          }
        </g>
      </svg>
    )
  }

}
