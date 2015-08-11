'use strict';
import React from 'react';
import Rx from 'rx';
import { Vector } from 'core';

export default class DrawingSurface extends React.Component {

  constructor(props) {
    super(props);
    this.onMouseDown = e => console.log(this.getPos(e));
    this.onTouchStart = e => console.log(this.getPos(e));
  }

  getPos(e) {
    let rect = this.container.getBoundingClientRect();
    return new Vector(e.pageX - rect.left, e.pageY - rect.top);
  }

  render() {
    return (
      <div {...this.props}
        ref={component => this.container = React.findDOMNode(component)}
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onTouchStart}
      >
        { this.props.children }
      </div>
    );
  }
}
