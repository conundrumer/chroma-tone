// import classNames from 'classnames';
import React from 'react'
import PureComponent from 'react-pure-render/component';
import { Dialog, CircularProgress } from 'material-ui'
import Dropzone from 'react-dropzone'
import { hideFileLoader, loadFile } from '../actions'

import '../styles/FileLoader.less'

export default class FileLoader extends PureComponent {

  componentWillReceiveProps(nextProps) {
    if (this.props.open && !nextProps.open) {
      this.dialog.dismiss();
    }
    if (!this.props.open && nextProps.open) {
      this.dialog.show();
    }
  }

  render() {
    return (
      <Dialog
        ref={component => this.dialog = component}
        title='Load From File'
        openImmediately={this.props.open}
        modal={true}
        actions={[{ text: 'Cancel' }]}
        onDismiss={() => this.props.dispatch(hideFileLoader())}
      >
        <Dropzone
          className='file-loader-dropzone'
          activeClassName='file-loader-dropzone active'
          onDrop={file => this.props.dispatch(loadFile(file))}
          multiple={false}
        >
          {
            this.props.loadingFile ? [
              <CircularProgress key={0} mode="indeterminate" />,
              <p key={1}>Loading file</p>
            ] : [
              <p key={2}>{'Drag and drop the file into this box'}</p>,
              <p key={3}>Or click in this box to select the file</p>
            ].concat(this.props.error ? [
              <p key={4}>Something wrong happened:</p>,
              <p key={5}><i>{this.props.error}</i></p>
            ] : [])
          }

        </Dropzone>
      </Dialog>
    )
  }

}
