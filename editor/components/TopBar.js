import React from 'react'
import classNames from 'classnames'
import PaperBar from './PaperBar'
import ButtonGroups from './ButtonGroups'

export default class TopBar extends React.Component {

  render() {
    let closed = this.props.closed;
    return (
      <PaperBar className={classNames('top', {closed: closed})}>
        <ButtonGroups className='top'>
          { this.props.children }
        </ButtonGroups>
      </PaperBar>
    );
  }
}
