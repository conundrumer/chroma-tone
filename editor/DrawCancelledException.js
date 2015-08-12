'use strict';

export default class DrawCancelledException extends Error {
  constructor(message = "This should be handled by the current tool function") {
    super();
    this.message = message;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;
  }
}
