var React = require('react');
var _ = require('lodash');

var Grid = React.createClass({

  shouldComponentUpdate(nextProps, nextState) {
    let keys = ['zoom'];

    return this.props.track.label !== nextProps.track.label ||
      keys.some((key) => this.props[key] !== nextProps[key]) ||
      this.props.track.lines.length !== nextProps.track.lines.length;
  },

  renderCell(cell) {
    let gridSize = this.props.grid.gridSize;
    let numLines = cell.getLines().length;
    let numLinesRed = (numLines > 0) ? 255 : 230;
    let numLinesBlue = numLines > 0 ? Math.round(255 / Math.pow(1+numLines, 0.4)) : 230;
    let numLinesGreen = numLines > 0 ? Math.round(255 / Math.pow(1+numLines, 0.2)) : 240;
    return (
      <rect
        key={cell.key}
        x={cell.x * gridSize}
        y={cell.y * gridSize}
        width={gridSize}
        height={gridSize}
        fill={`rgb(${numLinesRed}, ${numLinesGreen}, ${numLinesBlue})`}
      />
    );
  },

  render() {
    return (
      <g>
        { _.values(this.props.grid.cells).map(this.renderCell) }
      </g>
    );
  }

});

module.exports = Grid;
