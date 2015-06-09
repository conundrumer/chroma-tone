'use strict';

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
  for (let i = 0; i < 40; i++) {
    lines.push([2 * getNum(), getNum(), 2 * getNum(), getNum()]);
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

  componentWillMount() {
    ThemeManager.setComponentThemes({
      toolbar: {
        backgroundColor: 'white'
      }
    });
  },

  componentWillUnmount() {
    this.state.combokeys.detach();
  },

  openToolbars() {
    this.setState({ toolbarsVisible: true });
  },

  closeToolbars() {
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
      smallIcon: { padding: '9px', width: 42, height: 42 }
    };

    return styles;
  },

  getButtons() {
    var styles = this.getStyles();

    return {
      floatLeft: [{
        icon: 'undo-variant',
        style: styles.floatCircle,
        onClick: this.toggleDebug
      }],
      floatMiddle: [
        { icon: 'pencil', hotkey: 'q', onClick: doNothing },
        { icon: 'line', hotkey: 'w', onClick: doNothing },
        { icon: 'eraser', hotkey: 'e', onClick: doNothing },
        { icon: 'cursor-move', hotkey: 'r', onClick: doNothing },
        { icon: 'magnify', hotkey: 't', onClick: doNothing },
        { icon: 'play', hotkey: 'y', onClick: doNothing },
        { icon: 'stop', hotkey: 'u', onClick: doNothing },
        { icon: 'flag-variant', hotkey: 'i', onClick: doNothing },
        { icon: 'content-save', hotkey: 'o', onClick: doNothing },
        { icon: 'help-circle', hotkey: 'p', onClick: doNothing }
      ].map(button => {
          button.style = styles.smallIcon;
          return button;
      }),
      floatRight: [{
        icon: 'chevron-down',
        style: styles.floatCircle,
        onClick: this.openToolbars
      }],
      topLeft: [
        { icon: 'content-save', onClick: doNothing },
        { icon: 'undo-variant', onClick: doNothing },
        { icon: 'redo-variant', onClick: doNothing }
      ],
      topMiddle: [
        { icon: 'cursor-default', onClick: doNothing },
        { icon: 'pencil', onClick: doNothing },
        { icon: 'brush', onClick: doNothing },
        { icon: 'line', onClick: doNothing },
        { icon: 'curve', onClick: doNothing },
        { icon: 'multi-line', onClick: doNothing },
        { icon: 'eraser', onClick: doNothing }
      ],
      topRight: [
        { icon: 'settings', onClick: doNothing },
        { icon: 'message', onClick: doNothing },
        { icon: 'chevron-up', onClick: this.closeToolbars }
      ],
      bottomLeft: [
        { icon: 'layers', onClick: doNothing },
        { icon: 'viewfinder', onClick: doNothing },
        { icon: 'cursor-move', onClick: doNothing },
        { icon: 'magnify', onClick: doNothing }
      ],
      bottomMiddle: [
        { icon: 'flag-outline-variant', onClick: doNothing },
        { icon: 'flag-variant', onClick: doNothing },
        { icon: 'play', onClick: doNothing },
        { icon: 'stop', onClick: doNothing },
        { icon: 'pause', onClick: doNothing }
      ],
      bottomRight: [
        { icon: 'video', onClick: doNothing },
        { icon: 'movie', onClick: doNothing },
        { icon: 'help-circle', onClick: doNothing },
        {
          icon: this.state.timeControlVisible ? 'chevron-down' : 'chevron-up',
          onClick: this.toggleTimeControl
        }
      ],
      timeControl: [
        { icon: 'onion-skin', onClick: doNothing },
        { icon: 'rewind', onClick: doNothing },
        { icon: 'skip-previous', onClick: doNothing },
        {
          render: (i) =>
          <div key={i} className='timeline'>
            <input type='range' min={0} max={100} defaultValue={0} style={{width: '100%'}} />
          </div>
        },
        { icon: 'skip-next', onClick: doNothing },
        { icon: 'fast-forward', onClick: doNothing },
        { icon: 'music-note', onClick: doNothing }
      ]
    };
  },

  renderButtons(buttons) {
    return buttons.map((button, i) =>
      button.render ?
        button.render(i) :
      this.state.debugButtons ?
        <button key={i} style={{width: 48, height: 48, padding: 0}} {...button} /> :
        <IconButton {...button} key={i} combokeys={this.state.combokeys} />
    );
  },

  renderButtonGroups(groups) {
    return groups.map((group, i) =>
      <div key={i} className='toolbar-group'>
        { this.renderButtons(group) }
      </div>
    );
  },

  renderFloatBar(buttons) {
    var floatPapersProps = [
      { circle: true, children: this.renderButtons(buttons.floatLeft) },
      {
        className: 'float-paper-bar',
        children:
          <Toolbar className='float-toolbar'>
            {
              this.renderButtons(buttons.floatMiddle)
            }
          </Toolbar>
      },
      { circle: true, children: this.renderButtons(buttons.floatRight) }
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

  renderTopBar(buttons) {
    return (
      <CSSTransitionGroup transitionName='top'>
        {
          this.state.toolbarsVisible ?
          <PaperBar className='top'>
            <Toolbar className='top'>
              {
                this.renderButtonGroups([buttons.topLeft, buttons.topMiddle, buttons.topRight])
              }
            </Toolbar>
          </PaperBar>
          : null
        }
      </CSSTransitionGroup>
    );
  },

  renderBottomBar(buttons) {
    var bottomPaperBarClass = this.state.timeControlVisible ? 'bottom-extended' : 'bottom';

    return (
      <CSSTransitionGroup transitionName={bottomPaperBarClass}>
        {
          this.state.toolbarsVisible ?
          <PaperBar className={bottomPaperBarClass}>
            <Toolbar>
              {
                this.renderButtonGroups([buttons.bottomLeft, buttons.bottomMiddle, buttons.bottomRight])
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
                    this.renderButtons(buttons.timeControl)
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
    var buttons = this.getButtons();

    return (
      <div className='LR-Editor'>
        <SvgDisplay lines={LINES} />
        { this.renderFloatBar(buttons) }
        { this.renderTopBar(buttons) }
        { this.renderBottomBar(buttons) }
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

