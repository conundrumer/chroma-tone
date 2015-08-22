import React from 'react'
import { Paper } from 'material-ui'

export default class PaperBar extends React.Component {
  render() {
    return (
      <Paper
        className={'paper-bar ' + (this.props.className || '')}
        rounded={false}
        transitionEnabled={false}
        onTouchStart={e => e.preventDefault()}
        onMouseDown={e => e.preventDefault()}
      >
        {this.props.children}
      </Paper>
    );
  }
}
