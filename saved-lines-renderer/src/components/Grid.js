var React = require('react');
var _ = require('lodash');

var GRIDSIZE = require('../line-store').GRIDSIZE;

function parseCellCor(x) {
  return parseInt(x.toString().replace(/[^\d.-]/g, ''));
}

var Grid = React.createClass({

  shouldComponentUpdate(nextProps, nextState) {
    let keys = ['zoom'];

    return this.props.track.label !== nextProps.track.label ||
      keys.some((key) => this.props[key] !== nextProps[key]) ||
      this.props.track.lines.length !== nextProps.track.lines.length;
  },

  renderCell(keyX, keyY, x, y) {
    let cell = this.props.grid[keyX][keyY];
    let lines = cell.solidLines || cell.storage2;
    let numLines = Object.keys(lines).length;
    let numLinesRed = (numLines > 0) ? 255 : 230;
    let numLinesBlue = numLines > 0 ? Math.round(255 / Math.pow(1+numLines, 0.4)) : 230;
    let numLinesGreen = numLines > 0 ? Math.round(255 / Math.pow(1+numLines, 0.2)) : 240;
    return (
      <rect
        key={`${x}_${y}`}
        x={x * GRIDSIZE}
        y={y * GRIDSIZE}
        width={GRIDSIZE}
        height={GRIDSIZE}
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
                this.renderCell(x, y, parseCellCor(x), parseCellCor(y))
              )
            )
          )
        }
      </g>
    );
  }

});

module.exports = Grid;
