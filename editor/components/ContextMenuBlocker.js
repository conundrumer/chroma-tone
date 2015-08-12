'use strict';
import React from 'react';

export default class ContextMenuBlocker extends React.Component {
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
        onContextMenu={ e => this.props.block ? e.preventDefault() : null}
      />
    );
  }
}
