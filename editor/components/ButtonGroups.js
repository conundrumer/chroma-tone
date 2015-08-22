import React from 'react'
import Toolbar from './Toolbar'

export default class ButtonGroups extends React.Component {
  render() {
    return (
      <Toolbar className={this.props.className}>
        {['left', 'middle', 'right'].map( position =>
          <div key={position} className='toolbar-group'>
            { this.props.children[position] }
          </div>
        )}
      </Toolbar>
    );
  }
}
