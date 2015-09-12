'use strict';
import React from 'react';
import Rx from 'rx';
import mouse from 'mouse-event'
import {Vec2} from 'core';
const Vector = Vec2;


import { draw, deltaPanModZoom } from '../actions';
import DrawCancelledException from '../DrawCancelledException';

// TODO: refactor this stuff
function copyEvent(e) {
  let {identifier, buttons, pageX, pageY, isMouse} = e;
  return {
    id: identifier,
    buttons,
    pageX,
    pageY,
    isMouse,
    preventDefault: () => e.preventDefault ? e.preventDefault() : null
  }
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
      copy.isMouse = true
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
      .map(e => { e.preventDefault(); return e })
      // I would simply flatten e.changedTouches instead of making it a stream
      // but i do'nt know how
      .flatMap(makeStreamFromChangedTouches)
      .merge(makeStreamFromEvent(...mouseArgs)
        .map(e => {
          if (e.buttons == null) {
            e.buttons = mouse.buttons(e)
          }
          return e
        })
        .flatMap(makeStreamFromButtons)
      )
      .map(copyEvent)
  );

  // handle mouseup not firing
  let mouseMoveEndStream;
  [moveStream, mouseMoveEndStream] = moveStream.partition( e =>
    e.id !== null || e.buttons > 0
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
    return {
      stream,
      isMiddle: startEvent.isMouse && startEvent.id == MIDDLE,
      isRight: startEvent.isMouse && startEvent.id == RIGHT,
    }
  };

  return startStream.map(makeDrawStreamFromStartEvent);
}

export default class DrawingSurface extends React.Component {

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.drawStreamActive && !nextProps.drawStreamActive) {
      this.cancelObserver.onError(new DrawCancelledException())
    }
  }

  componentDidMount() {
    let unmountStream = Rx.Observable.create( observer => {
      this.unmountObserver = observer;
    });

    let cancelStream = Rx.Observable.create( observer => {
      this.cancelObserver = observer;
    });
    cancelStream.subscribe(() => {}, () => {})

    let wheelStream = Rx.Observable.create( observer => {
      this.wheelObserver = observer;
    });

    let streamOfDrawStreams = makeStreamOfDrawStreams(this.container, unmountStream, cancelStream);

    streamOfDrawStreams.subscribe(({stream, ...options}) => {
      stream = stream.map(e => this.getPos(e))
      let cancellableStream = stream.merge(cancelStream).takeUntil(stream.last())
      this.props.dispatch(draw(stream, cancellableStream, options))
    });

    wheelStream.subscribe(e => {
      if (e.deltaMode !== 0) {
        // handle only pixel wheels
        return
      }
      e.preventDefault()
      let delta = new Vector(e.deltaX, e.deltaY)
      let pos = this.getPos(e)
      this.props.dispatch(deltaPanModZoom(pos, delta))
    })
  }

  componentWillUnmount() {
    if (this.unmountObserver) {
      this.unmountObserver.onNext(true);
      this.unmountObserver.onComplete();
    }
    if (this.cancelObserver) {
      this.cancelObserver.onComplete()
    }
    if (this.wheelObserver) {
      this.wheelObserver.onComplete();
    }
  }

  onWheel(e) {
    this.wheelObserver.onNext(e)
  }

  getPos(e) {
    let rect = this.container.getBoundingClientRect();
    return new Vector(e.pageX - rect.left, e.pageY - rect.top);
  }

  render() {
    return (
      <div
        style={{ position: 'absolute', width: '100%', height: '100%'}}
        ref={(component) => { this.container = React.findDOMNode(component); }}
        onWheel={ e => this.onWheel(e) }
      >
        { this.props.children }
      </div>
    );
  }
}
