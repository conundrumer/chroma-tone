import React from 'react'

export default class Toolbar extends React.Component {
  render() {
    return (
      <div
        className={'toolbar ' + (this.props.className || '')}
      >
        {this.props.children}
      </div>
    );
  }
}
