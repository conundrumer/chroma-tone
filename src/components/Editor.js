'use strict';

var _ = require('lodash');
var React = require('react/addons');
var Combokeys = require('combokeys');
var CSSTransitionGroup = React.addons.CSSTransitionGroup;
var mui = require('material-ui');
var ThemeManager = new mui.Styles.ThemeManager();

var {Paper} = mui;
var SvgDisplay = require('./SvgDisplay');
var IconButton = require('./IconButton');

//var Actions = require('actions/xxx')

require('styles/Editor.less');

function doNothing() {}

function randomLines() {
  var lines = [];
  var limits = 900;
  var getNum = () => Math.random() * limits - 100;
  var getLineType = () => Math.floor(3 * Math.random());
  for (let i = 0; i < 40; i++) {
    lines.push([2 * getNum(), getNum(), 2 * getNum(), getNum(), getLineType()]);
  }
  return lines;
}

var LINES = randomLines();

var Editor = React.createClass({

  getInitialState() {
    return {
      debugButtons: false,
      toolbarsVisible: false,
      timeControlVisible: false,
      combokeys: new Combokeys(document)
    };
  },

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentWillUnmount() {
    this.state.combokeys.detach();
  },

  showToolbars() {
    this.setState({ toolbarsVisible: true });
  },

  hideToolbars() {
    this.setState({ toolbarsVisible: false });
  },

  toggleTimeControl() {
    this.setState({ timeControlVisible: !this.state.timeControlVisible });
  },

  toggleDebug() {
    this.setState({debugButtons: !this.state.debugButtons});
  },

  getStyles() {
    var styles = {
      floatCircle: { padding: '0px', width: 42, height: 42 },
      smallIcon: { padding: '6px', width: 36, height: 36, margin: '3px' },
      defaultIcon: { padding: '9px', width: 42, height: 42, margin: '3px' }
    };

    return styles;
  },

  getButtons() {
    return {
      // editing tool group
      line: { icon: 'line', hotkey: 'w', onClick: doNothing },
      pencil: { icon: 'pencil', hotkey: 'q', onClick: doNothing },
      brush: { icon: 'brush', onClick: doNothing },
      curve: { icon: 'curve', onClick: doNothing },
      multiLine: { icon: 'multi-line', onClick: doNothing },
      select: { icon: 'cursor-default', onClick: doNothing },
      eraser: { icon: 'eraser', hotkey: 'e', onClick: doNothing },
      // track state group
      save: { icon: 'content-save', hotkey: 'o', onClick: doNothing },
      undo: { icon: 'undo-variant', onClick: this.toggleDebug },
      redo: { icon: 'redo-variant', onClick: doNothing },
      // space navigation group
      pan: { icon: 'cursor-move', hotkey: 'r', onClick: doNothing },
      zoom: { icon: 'magnify', hotkey: 't', onClick: doNothing },
      viewfinder: { icon: 'viewfinder', onClick: doNothing },
      layers: { icon: 'layers', onClick: doNothing },
      // time navigation group
      play: { icon: 'play', hotkey: 'y', onClick: doNothing },
      pause: { icon: 'pause', onClick: doNothing },
      stop: { icon: 'stop', hotkey: 'u', onClick: doNothing },
      rewind: { icon: 'rewind', onClick: doNothing },
      fastFoward: { icon: 'fast-forward', onClick: doNothing },
      stepBack: { icon: 'skip-previous', onClick: doNothing },
      stepForward: { icon: 'skip-next', onClick: doNothing },
      flag: { icon: 'flag-variant', hotkey: 'i', onClick: doNothing },
      multiFlag: { icon: 'flag-outline-variant', onClick: doNothing },
      onionSkin: { icon: 'onion-skin', onClick: doNothing },
      // special feature group
      camera: { icon: 'video', onClick: doNothing },
      music: { icon: 'music-note', onClick: doNothing },
      record: { icon: 'movie', onClick: doNothing },
      // toolbar visibility group
      showToolbars: { icon: 'chevron-down', onClick: this.showToolbars },
      hideToolbars: { icon: 'chevron-up', onClick: this.hideToolbars },
      toggleTimeControl: { icon: 'chevron-down', onClick: this.toggleTimeControl },
      // misc
      chat: { icon: 'message', onClick: doNothing },
      settings: { icon: 'settings', onClick: doNothing },
      help: { icon: 'help-circle', hotkey: 'p', onClick: doNothing }
    };
  },

  getButtonGroups() {
    var b = this.getButtons();
    var styles = this.getStyles();

    b.toggleTimeControl.style = styles.defaultIcon;
    b.toggleTimeControl.style.transform = this.state.timeControlVisible ? 'rotate(0deg)' : 'rotate(180deg)';

    var floatUndo = _.clone(b.undo);
    floatUndo.style = styles.floatCircle;
    b.showToolbars.style = styles.floatCircle;

    var timeline = {
      render: (i) =>
      <div key={i} className='timeline'>
        <input type='range' min={0} max={100} defaultValue={0} style={{width: '100%'}} />
      </div>
    };

    var buttonGroups = {
      floatLeft: [
        floatUndo
      ],
      floatMiddle: [
        b.pencil, b.line, b.eraser, b.pan, b.zoom, b.play, b.stop, b.flag, b.save, b.help
      ],
      floatRight: [
        b.showToolbars
      ],
      topGroups: [
        [ b.save, b.undo, b.redo ],
        [ b.select, b.pencil, b.brush, b.line, b.curve, b.multiLine, b.eraser ],
        [ b.settings, b.chat, b.hideToolbars ]
      ],
      bottomGroups: [
        [ b.layers, b.viewfinder, b.pan, b.zoom ],
        [ b.multiFlag, b.flag, b.play, b.stop, b.pause ],
        [ b.camera, b.record, b.help, b.toggleTimeControl ]
      ],
      timeControl: [
        b.onionSkin, b.rewind, b.stepBack, timeline, b.stepForward, b.fastFoward, b.music
      ]
    };

    buttonGroups.floatMiddle = buttonGroups.floatMiddle.map(button => {
      button = _.clone(button);
      button.style = styles.smallIcon;
      return button;
    });

    return buttonGroups;
  },

  renderButtons(buttons) {
    return buttons.map((button, i) =>
      button.render ?
        button.render(i) :
      this.state.debugButtons ?
        <button key={i} style={{width: 48, height: 48, padding: 0}} {...button} /> :
        <IconButton {...button}
          key={i}
          style={button.style || this.getStyles().defaultIcon}
          combokeys={this.state.combokeys}
          selected={this.state.pressed && this.state.pressed === button.hotkey}
          onTouchTap={button.hotkey && (() => this.setState({pressed: button.hotkey}))}
        />
    );
  },

  renderButtonGroups(groups) {
    return groups.map((group, i) =>
      <div key={i} className='toolbar-group'>
        { this.renderButtons(group) }
      </div>
    );
  },

  renderFloatBar(buttonGroups) {
    var floatPapersProps = [
      { circle: true, children: this.renderButtons(buttonGroups.floatLeft) },
      {
        className: 'float-paper-bar',
        children:
          <Toolbar className='float-toolbar'>
            {
              this.renderButtons(buttonGroups.floatMiddle)
            }
          </Toolbar>
      },
      { circle: true, children: this.renderButtons(buttonGroups.floatRight) }
    ];

    return (
      <div className='float-container'>
        {floatPapersProps.map((props, i) =>
          <CSSTransitionGroup key={i} transitionName='float-paper'>
            {
              !this.state.toolbarsVisible ?
                <FloatPaper {...props}>
                  {props.children}
                </FloatPaper>
              : null
            }
          </CSSTransitionGroup>
        )}
      </div>
    );
  },

  renderTopBar(buttonGroups) {
    return (
      <CSSTransitionGroup transitionName='top'>
        {
          this.state.toolbarsVisible ?
          <PaperBar className='top'>
            <Toolbar className='top'>
              {
                this.renderButtonGroups(buttonGroups.topGroups)
              }
            </Toolbar>
          </PaperBar>
          : null
        }
      </CSSTransitionGroup>
    );
  },

  renderBottomBar(buttonGroups) {
    var bottomPaperBarClass = this.state.timeControlVisible ? 'bottom-extended' : 'bottom';

    return (
      <CSSTransitionGroup transitionName={bottomPaperBarClass}>
        {
          this.state.toolbarsVisible ?
          <PaperBar className={bottomPaperBarClass}>
            <Toolbar>
              {
                this.renderButtonGroups(buttonGroups.bottomGroups)
              }
            </Toolbar>
            <CSSTransitionGroup
              className='toolbar time-control-toolbar'
              transitionName='time-control-toolbar'
            >
              {
                this.state.timeControlVisible ?
                <div className='toolbar-group time-control'>
                  {
                    this.renderButtons(buttonGroups.timeControl)
                  }
                </div>
                : null
              }
            </CSSTransitionGroup>
          </PaperBar>
          : null
        }
      </CSSTransitionGroup>
    );
  },

  render() {
    var buttonGroups = this.getButtonGroups();

    return (
      <div className='LR-Editor'>
        <SvgDisplay lines={LINES} />
        { this.renderFloatBar(buttonGroups) }
        { this.renderTopBar(buttonGroups) }
        { this.renderBottomBar(buttonGroups) }
      </div>
    );
  }
});

var Toolbar = React.createClass({
  render() {
    return (
      <div className={'toolbar ' + (this.props.className || '')}>
        {this.props.children}
      </div>
    );
  }
});

var PaperBar = React.createClass({
  render() {
    return (
      <Paper
        className={'paper-bar ' + (this.props.className || '')}
        rounded={false}
        transitionEnabled={false}
      >
        {this.props.children}
      </Paper>
    );
  }
});

var FloatPaper = React.createClass({
  render() {
    return (
      <Paper
        className={'float-paper ' + (this.props.className || '')}
        circle={this.props.circle}
        style={{boxShadow: 'null'}}
        transitionEnabled={false}
      >
        {this.props.children}
      </Paper>
    );
  }
});

module.exports = Editor;

