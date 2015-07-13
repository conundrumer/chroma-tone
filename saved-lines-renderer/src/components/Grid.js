var React = require('react');
var _ = require('lodash');

var GRIDSIZE = require('../line-store').GRIDSIZE;

var Grid = React.createClass({

  renderCell(x, y) {
    let k = this.props.zoom;
    let numLines = this.props.grid[x][y].solidLines.length;
    let noLineColor = (numLines > 0) ? 255 : 0;
    let numLinesColor = numLines > 0 ? Math.round(255 / (1+numLines)) : 0;
    return (
      <rect
        key={`${x}_${y}`}
        x={k * x * GRIDSIZE}
        y={k * y * GRIDSIZE}
        width={k * GRIDSIZE}
        height={k * GRIDSIZE}
        fill={`rgb(${noLineColor}, ${noLineColor}, ${numLinesColor})`}
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
