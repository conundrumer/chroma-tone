import React, { PropTypes } from 'react'
import PureComponent from 'react-pure-render/component';
import { Dialog, CircularProgress, FlatButton, RaisedButton } from 'material-ui'
import { hideTrackSaver } from '../actions'

export default class TrackSaver extends PureComponent {

  static get propTypes() {
    return {
      open: PropTypes.bool.isRequired,
      trackData: PropTypes.object
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
        {JSON.stringify(this.props.trackData)}
      </Dialog>
    )
  }

}
