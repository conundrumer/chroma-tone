'use strict';

describe('Editor', function () {
  var React = require('react/addons');
  var Editor, component;

  beforeEach(function () {
    Editor = require('components/Editor.js');
    component = React.createElement(Editor);
  });

  it('should create a new instance of Editor', function () {
    expect(component).toBeDefined();
  });
});
