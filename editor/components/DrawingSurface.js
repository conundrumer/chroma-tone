'use strict';
import React from 'react';
import Rx from 'rx';
import { Vector } from 'core';

import { draw } from '../actions';
import DrawCancelledException from '../DrawCancelledException';

// https://developer.mozilla.org/en-US/docs/Web/API/Touch_events#Copying_a_touch_object
function copyEvent({identifier, pageX, pageY}) {
  return { id: identifier, pageX, pageY };
}
function blockEvent(e) {
  e.preventDefault();
  e.stopPropagation();
}
function makeStreamFromChangedTouches(e) {
  return Rx.Observable.from(e.changedTouches);
}
function makeExceptionStream() {
  return Rx.Observable.throw(new DrawCancelledException());
}

function makeStreamOfDrawStreams(container, unmountStream) {

  let makeStreamFromEvent = (eventType, node, doBlockEvent) => {
    let stream = Rx.Observable.fromEvent(node, eventType)
      .takeUntil(unmountStream);
    if (doBlockEvent) {
      stream.subscribe(blockEvent);
    }
    return stream;
  };

  let touchCancelStream = makeStreamFromEvent('touchcancel', window, false)
    .flatMap(makeStreamFromChangedTouches)
    .map(copyEvent);

  // merge touches and mouse streams
  // this owuld be slightly nicer if we had pointer events but not by much
  let [startStream, moveStream, endStream] = [{
      mouseArgs: ['mousedown', container, false],
      touchArgs: ['touchstart', container, true]
    }, {
      mouseArgs: ['mousemove', window, true],
      touchArgs: ['touchmove', window, true]
    }, {
      mouseArgs: ['mouseup', window, true],
      touchArgs: ['touchend', window, true]
  }].map(({ mouseArgs, touchArgs }) =>
    makeStreamFromEvent(...touchArgs)
      // I would simply flatten e.changedTouches instead of making it a stream
      // but i do'nt know how
      .flatMap(makeStreamFromChangedTouches)
      .merge(makeStreamFromEvent(...mouseArgs))
      .map(copyEvent)
  );

  let makeDrawStreamFromStartEvent = (startEvent) => {
    let partOfStream = ({id}) => startEvent.id === id;
    return moveStream.filter(partOfStream)
      .startWith(startEvent)
      .merge(touchCancelStream
        .filter(partOfStream)
        .merge(unmountStream)
        .flatMap(makeExceptionStream)
      )
      .takeUntil(endStream.filter(partOfStream));
  };

  return startStream.map(makeDrawStreamFromStartEvent);
}

export default class DrawingSurface extends React.Component {

  componentDidMount() {
    let unmountStream = Rx.Observable.create( observer => {
      this.unmountObserver = observer;
    });

    let streamOfDrawStreams = makeStreamOfDrawStreams(this.container, unmountStream);

    streamOfDrawStreams.subscribe(drawStream =>
      this.props.dispatch(draw(drawStream.map(e => this.getPos(e))))
    );
  }

  componentWillUnmount() {
    if (this.unmountObserver) {
      this.unmountObserver.onNext(true);
      this.unmountObserver.onComplete();
    }
  }

  getPos(e) {
    let rect = this.container.getBoundingClientRect();
    return new Vector(e.pageX - rect.left, e.pageY - rect.top);
  }

  render() {
    return (
      <div className={this.props.className} ref={(component) => { this.container = React.findDOMNode(component); }}>
        { this.props.children }
      </div>
    );
  }
}
