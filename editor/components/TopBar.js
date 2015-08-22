import React from 'react'
import PureComponent from 'react-pure-render/component';
import classNames from 'classnames'
import PaperBar from './PaperBar'
import ButtonGroups from './ButtonGroups'

export default class TopBar extends PureComponent {

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
