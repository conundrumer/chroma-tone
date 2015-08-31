import React, { PropTypes } from 'react'
import PureComponent from 'react-pure-render/component';
import { Dialog, CircularProgress, FlatButton, RaisedButton } from 'material-ui'
import { hideTrackSaver } from '../actions'

import 'pui-css-code/code.css'
import '../styles/TrackSaver.less'

export default class TrackSaver extends PureComponent {

  static get propTypes() {
    return {
      open: PropTypes.bool.isRequired,
      trackData: PropTypes.object,
      trackDataJSON: PropTypes.string
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.open && !nextProps.open) {
      this.dialog.dismiss();
    }
    if (!this.props.open && nextProps.open) {
      this.dialog.show();
    }
  }

  getActions() {
    return [
      <RaisedButton style={{margin: 10}} primary={true} key={0} label='Save To File' onTouchTap={() => {}} />,
      <RaisedButton style={{margin: 10}} primary={true} key={1} label='Save To Pastebin*' onTouchTap={() => {}} />,
      <FlatButton secondary={true} key={2} label='Done' onTouchTap={() => this.props.dispatch(hideTrackSaver())} />
    ]
  }

  onClickJson() {
    let range = document.createRange();
    range.selectNode(this.codeBlock);
    window.getSelection().addRange(range);
  }

  render() {
    return (
      <Dialog
        ref={component => this.dialog = component}
        title='Save Track'
        openImmediately={this.props.open}
        modal={true}
        actions={this.getActions()}
        autoScrollBodyContent={true}
        style={{height: '100%'}}
        contentStyle={{height: '100%'}}
        bodyStyle={{height: '1000px'}}
      >
        <div className='track-saver-code-block' onTouchTap={() => this.onClickJson()}>
          <pre className='pre-scrollable'>
            <code ref={c => this.codeBlock = React.findDOMNode(c)}>{this.props.trackDataJSON}</code>
          </pre>
        </div>
      </Dialog>
    )
  }

}
