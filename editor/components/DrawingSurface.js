'use strict';
import React from 'react';
import Rx from 'rx';
import Vector from 'core/Vector';

import { draw } from '../actions';
import DrawCancelledException from '../DrawCancelledException';

function copyEvent(e) {
  let {identifier, buttons, pageX, pageY} = e;
  return { id: identifier, buttons, pageX, pageY, preventDefault: () => e.preventDefault() };
}
function blockEvent(e) {
  e.preventDefault();
}
function makeStreamFromChangedTouches(e) {
  return Rx.Observable.from(e.changedTouches);
}
// support only left/middle/right buttons
const [LEFT, MIDDLE, RIGHT] = [0, 1, 2]
const buttons = [LEFT, MIDDLE, RIGHT]
const buttonBits = {
  [LEFT]: 1,
  [RIGHT]: 2,
  [MIDDLE]: 4
}
function makeStreamFromButtons(e) {
  return Rx.Observable.from(buttons
    .filter(id => e.type === 'mousemove' ?
      !!(buttonBits[id] & e.buttons) :
      id === e.button
    )
    .map(id => {
      let copy = copyEvent(e)
      copy.identifier = id
      return copy
    })
  )
}
function makeExceptionStream() {
  return Rx.Observable.throw(new DrawCancelledException());
}

function makeStreamOfDrawStreams(container, unmountStream) {
  let makeStreamFromEvent = (eventType, node) => {
    let stream = Rx.Observable.fromEvent(node, eventType)
      .takeUntil(unmountStream);
    return stream;
  };

  let touchCancelStream = makeStreamFromEvent('touchcancel', window)
    .flatMap(makeStreamFromChangedTouches)
    .map(copyEvent);

  // merge touches and mouse streams
  // this owuld be slightly nicer if we had pointer events but not by much
  let [startStream, moveStream, endStream] = [{
    mouseArgs: ['mousedown', container],
    touchArgs: ['touchstart', container]
  }, {
    mouseArgs: ['mousemove', window],
    touchArgs: ['touchmove', window]
  }, {
    mouseArgs: ['mouseup', window],
    touchArgs: ['touchend', window]
  }].map(({ mouseArgs, touchArgs }) =>
    makeStreamFromEvent(...touchArgs)
      // I would simply flatten e.changedTouches instead of making it a stream
      // but i do'nt know how
      .flatMap(makeStreamFromChangedTouches)
      .merge(makeStreamFromEvent(...mouseArgs)
        .flatMap(makeStreamFromButtons)
      )
      .map(copyEvent)
  );

  // handle mouseup not firing
  let mouseMoveEndStream;
  [moveStream, mouseMoveEndStream] = moveStream.partition( e =>
    e.id || e.buttons > 0
  );
  endStream = endStream.merge(mouseMoveEndStream);

  // TODO: merge stream with mod key pressed stream
  let makeDrawStreamFromStartEvent = (startEvent) => {
    let partOfStream = ({id}) => startEvent.id === id;
    let stream = moveStream.filter(partOfStream)
      .startWith(startEvent)
      .merge(touchCancelStream
        .filter(partOfStream)
        .merge(unmountStream)
        .flatMap(makeExceptionStream)
      )
      .takeUntil(endStream.filter(partOfStream));
    stream.skip(1).subscribe(blockEvent)
    return stream
  };

  return startStream.map(makeDrawStreamFromStartEvent);
}

export default class DrawingSurface extends React.Component {

  shouldComponentUpdate() {
    return false;
  }

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
      <div style={{ position: 'absolute', width: '100%', height: '100%'}} ref={(component) => { this.container = React.findDOMNode(component); }}>
        { this.props.children }
      </div>
    );
  }
}
