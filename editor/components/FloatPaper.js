import React from 'react'
import { Paper } from 'material-ui'
import classNames from 'classnames'

export default class FloatPaper extends React.Component {
  render() {
    return (
      <Paper
        className={classNames('float-paper', this.props.className)}
        circle={this.props.circle}
        style={{boxShadow: 'null', pointerEvents: 'auto'}}
        transitionEnabled={false}
        onTouchStart={e => e.preventDefault()}
        onMouseDown={e => e.preventDefault()}
      >
        {this.props.children}
      </Paper>
    )
  }
}
