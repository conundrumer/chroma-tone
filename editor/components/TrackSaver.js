import _ from 'lodash'
import React, { PropTypes } from 'react'
import PureComponent from 'react-pure-render/component';
import { Dialog, FlatButton, RaisedButton, TextField, CardTitle } from 'material-ui'
import { hideTrackSaver, setTrackName } from '../actions'

import 'pui-css-code/code.css'
import '../styles/TrackSaver.less'

export default class TrackSaver extends PureComponent {

  // static get propTypes() {
  //   return {
  //     dispatch: PropTypes.func.isRequired,
  //     open: PropTypes.bool.isRequired,
  //     trackData: PropTypes.object,
  //     trackDataJSON: PropTypes.string,
  //     trackDataURI: PropTypes.string,
  //     label: PropTypes.string,
  //     fileName: PropTypes.string
  //   }
  // }

  constructor() {
    super()
    this.onNameChange = _.debounce((name) => {
      this.props.dispatch(setTrackName(name))
    }, 1000)
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
      <RaisedButton style={{margin: 10}} primary={true} key={0} label='Save To File'>
        <a style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          right: 0
        }}
        href={this.props.trackDataURI}
        download={this.props.fileName}
        />
      </RaisedButton>,
      <RaisedButton disabled={true} style={{margin: 10}} primary={true} key={1} label='Save To Pastebin*' onTouchTap={() => {}} />,
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
      >
        <TextField
          floatingLabelText='Track Name'
          defaultValue={this.props.label}
          onChange={e => this.onNameChange(e.target.value)}
        />
        <CardTitle style={{padding: '15px 0 0 0'}} subtitle='Track Data' />
        <div className='track-saver-code-block' onTouchTap={() => this.onClickJson()}>
          <pre className='pre-scrollable'>
            <code ref={c => this.codeBlock = React.findDOMNode(c)}>{this.props.trackDataJSON}</code>
          </pre>
        </div>
      </Dialog>
    )
  }

}
