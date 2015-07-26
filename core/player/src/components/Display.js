'use strict';

var React = require('react');

var Rider = require('./Rider');
var Grid = require('./Grid');

var LINE_WIDTH = 2;
var LINE_WIDTH_ZOOM_FACTOR = 0.001;
var MARGIN = 20;

function getLength(x1, y1, x2, y2) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// relative offset from normal and parallel
function getOffset(x1, y1, x2, y2, offset) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let length = Math.sqrt(dx * dx + dy * dy);
  let px = offset.p * dx / length;
  let py = offset.p * dy / length;
  let nx = offset.n * dy / length;
  let ny = offset.n * -dx / length;
  return {
    x1: x1 + nx + px,
    y1: y1 + ny + py,
    x2: x2 + nx + px,
    y2: y2 + ny + py
  };
}

function getViewBox(lines) {
    if (lines.length === 0) {
      return [0, 0, 0, 0];
    }
    // console.log('lines', lines)
    var box = [].concat.apply([], lines.map(line =>
      [{
        x: line.x1,
        y: line.y1
      }, {
        x: line.x2,
        y: line.y2
      }]
    ))
    .map(p => {
        return [p.x, p.y, p.x, p.y];
    })
    .reduce((a, b) => {
        return [
            Math.min(a[0], b[0]),
            Math.min(a[1], b[1]),
            Math.max(a[2], b[2]),
            Math.max(a[3], b[3])
        ];
    }, [
        Number.MAX_VALUE,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.MIN_VALUE
    ]);
    return [
        box[0] - LINE_WIDTH - MARGIN, // top
        box[1] - LINE_WIDTH - MARGIN, // left
        box[2] - box[0] + 2 * MARGIN, // width
        box[3] - box[1] + 2 * MARGIN // height
    ];
}

function getColor(type) {
  var blue500 = '#2196F3';
  var red500 = '#F44336';
  var lightGreen500 = '#8BC34A';
  switch (type) {
    case 0: // normal
      return blue500;
    case 1: // acc
      return red500;
    case 2: // scenery
      return lightGreen500;
  }
}

var Line = React.createClass({
  render() {
    let { line, color, zoom } = this.props;
    return (
      <line
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        stroke={color}
        strokeWidth={LINE_WIDTH * zoom}
        strokeLinecap='round'
      />
    );
  }
});

var FloorLine = React.createClass({
  render() {
    let { line, zoom } = this.props;
    if (line.length === 0) {
      return null;
    }
    let width = LINE_WIDTH * zoom / 2;
    let offsetAmount = width / 2;
    let offset = line.norm.clone().mulS(-offsetAmount);
    let p1 = line.p.clone().add(offset);
    let p2 = line.q.clone().add(offset);
    return (
      <line
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke='black'
        strokeWidth={width}
        strokeLinecap='butt'
      />
    );
  }
});

var AccArrow = React.createClass({
  render() {
    let { line, zoom } = this.props;
    let r = LINE_WIDTH * zoom / 2;
    let vec = line.vec.clone().divS(line.length).mulS(r);
    let norm = line.norm.clone().mulS(r);
    let p0 = line.q.clone().add(vec);
    let p1 = line.q.clone().add(vec.clone().mulS(-3.5)).add(norm.clone().mulS(3));
    let p2 = line.q.clone().add(vec.mulS(-Math.min(2, 1 + line.length / r)));
    return (
      <polyline
        points={
          [p0.x, p0.y, p1.x, p1.y, p2.x, p2.y]
        }
        fill={getColor(1)}
      />
    );
  }

});

var TrackLine = React.createClass({
  render() {
    let {
      line,
      zoom,
      color,
      floor,
      accArrow,
      snapDot
    } = this.props;

    let r = LINE_WIDTH * zoom / 2;
    let isScenery = (line.type === 2);
    if (!color || isScenery) {
      return <Line line={line} color={ color ? getColor(2) : 'black'} zoom={zoom}/>;
    }
    let parts = [
      <Line key={1} line={line} color={getColor(line.type)} zoom={zoom}/>
    ];
    if (floor) {
      parts = parts.concat([
        <FloorLine key={2} line={line} zoom={zoom}/>
      ]);
    }
    if (accArrow && line.type === 1) {
      parts = [
        <AccArrow key={3} line={line} zoom={zoom} />
      ].concat(parts);
    }
    if (!snapDot) {
      return <g>{parts}</g>;
    }
    if (line.leftExtended) {
      parts = parts.concat([
        <circle key={4} cx={line.x1} cy={line.y1} r={r} fill='black' />
      ]);
    }
    if (line.rightExtended) {
      parts = parts.concat([
        <circle key={5} cx={line.x2} cy={line.y2} r={r} fill='black' />
      ]);
    }
    return <g>{parts}</g>;
  }
});

var displayStyle = {
  position: 'absolute',
  width: '100%'
};

var LineDisplay = React.createClass({

  shouldComponentUpdate(nextProps, nextState) {
    let keys = ['zoom', 'color', 'floor', 'accArrow', 'snapDot'];

    return this.props.track.label !== nextProps.track.label ||
      keys.some((key) => this.props[key] !== nextProps[key]) ||
      this.props.lines.length !== nextProps.lines.length;
  },

  render() {
    return (
      <g>
        {
          this.props.lines.map((line, i) =>
            <TrackLine {...this.props} key={i} line={line} zoom={this.props.zoom} />
          )
        }
      </g>
    );
  }
});

var Display = React.createClass({

  getInitialState() {
    return { viewBox: null };
  },

  resetViewBox(track) {
    this.setState({ viewBox: getViewBox(track.lines).join(' ') });
  },

  getViewBox() {
    return this.props.viewBox || this.state.viewBox || '0 0 0 0';
  },

  getZoomFactor() {
    let dim = this.getViewBox().split(' ');
    let zoom = dim[2]; // width
    return Math.max(1, Math.pow(zoom * LINE_WIDTH_ZOOM_FACTOR, 0.5));
  },

  componentDidMount() {
    this.resetViewBox(this.props.track);
  },

  componentWillReceiveProps(nextProps) {
    if (!this.props.track) {
      this.setState({ viewBox: null });
    } else if(this.props.track !== nextProps.track ||
      this.props.track.lines.length !== nextProps.track.lines.length) {
        this.resetViewBox(nextProps.track);
    }
  },

  render() {
    let zoom = this.getZoomFactor();
    return (
      <div style={displayStyle} >
        <svg style={displayStyle} viewBox={this.getViewBox()}>
          {
            this.props.grid ?
              <Grid {...this.props} grid={this.props.track.store.solidGrid} zoom={zoom} />
            : null
          }
          <LineDisplay {...this.props} zoom={zoom} lines={this.props.track.lines} />
          <Rider rider={this.props.rider} zoom={zoom} />
        </svg>
      </div>
    );
  }

});

module.exports = Display;
