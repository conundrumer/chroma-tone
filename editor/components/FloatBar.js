import React from 'react'
import classNames from 'classnames'
import FloatPaper from './FloatPaper'
import Toolbar from './Toolbar'

export default class FloatBar extends React.Component {

  render() {
    let closed = this.props.closed;
    return (
      <div className='float-container' style={{pointerEvents: 'none'}}>
        {this.props.children.left.map( (child, i) =>
          <FloatPaper key={i} className={classNames({closed: closed})} circle={true}>
            { child }
          </FloatPaper>
        )}
        <FloatPaper className={classNames('float-paper-bar', {closed: closed})}>
          <Toolbar className='float-toolbar'>
            { this.props.children.middle }
          </Toolbar>
        </FloatPaper>
        {this.props.children.right.map( (child, i) =>
          <FloatPaper key={-i - 1} className={classNames({closed: closed})} circle={true}>
            { child }
          </FloatPaper>
        )}
      </div>
    );
  }
}
