import React from 'react'
import PureComponent from 'react-pure-render/component';
import classNames from 'classnames'
import _ from 'lodash'
import PaperBar from './PaperBar'
import ButtonGroups from './ButtonGroups'

export default class BottomBar extends PureComponent {
  render() {
    let closed = this.props.closed;
    let timeControlClosed = this.props.timeControlClosed;

    let bottomPaperBarClass = !timeControlClosed ? 'bottom-extended' : 'bottom';

    return (
      <PaperBar className={classNames(bottomPaperBarClass, {closed: closed})}>
        <ButtonGroups>
          { this.props.children[0] }
        </ButtonGroups>
        <div className={classNames('toolbar', 'time-control-toolbar', {closed: timeControlClosed})}>
          <div className='toolbar-group time-control'>
            { _.flatten(_.values(this.props.children[1])) }
          </div>
        </div>
      </PaperBar>
    );
  }
}
