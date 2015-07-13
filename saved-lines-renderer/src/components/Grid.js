var React = require('react');
var _ = require('lodash');

var GRIDSIZE = require('../line-store').GRIDSIZE;

var Grid = React.createClass({

  shouldComponentUpdate(nextProps, nextState) {
    let keys = ['zoom'];

    return this.props.track.label !== nextProps.track.label ||
      keys.some((key) => this.props[key] !== nextProps[key]) ||
      this.props.track.lines.length !== nextProps.track.lines.length;
  },

  renderCell(x, y) {
    let k = this.props.zoom;
    let numLines = this.props.grid[x][y].solidLines.length;
    let numLinesRed = (numLines > 0) ? 255 : 230;
    let numLinesBlue = numLines > 0 ? Math.round(255 / Math.pow(1+numLines, 0.4)) : 230;
    let numLinesGreen = numLines > 0 ? Math.round(255 / Math.pow(1+numLines, 0.2)) : 240;
    return (
      <rect
        key={`${x}_${y}`}
        x={k * x * GRIDSIZE}
        y={k * y * GRIDSIZE}
        width={k * GRIDSIZE}
        height={k * GRIDSIZE}
        fill={`rgb(${numLinesRed}, ${numLinesGreen}, ${numLinesBlue})`}
      />
    );
  },

  render() {
    let g = this.props.grid;
    return (
      <g>
        {
          _.flatten(
            _.keys(g).map( x =>
              _.keys(g[x]).map( y =>
                this.renderCell(parseInt(x), parseInt(y))
              )
            )
          )
        }
      </g>
    );
  }

});

module.exports = Grid;
