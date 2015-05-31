'use strict';

var React = require('react/addons');
var mui = require('material-ui');
var ThemeManager = new mui.Styles.ThemeManager();

var {Toolbar, Paper} = mui;
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

var Spacer = React.createClass({
  render() {
    return <div/>;
  }

});

var Editor = React.createClass({

  getInitialState() {
    return {
      toolbarsOpen: false,
      timeControlOpen: false
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

  openToolbars() {
    this.setState({ toolbarsOpen: true });
  },

  closeToolbars() {
    this.setState({ toolbarsOpen: false });
  },

  toggleTimeControl() {
    this.setState({ timeControlOpen: !this.state.timeControlOpen });
  },

  // this won't be necessary once dependency on material-ui is removed
  getStyles() {
    var styles = {
      floatCircle: { padding: '0px', width: 42, height: 42 },
      smallIcon: { padding: '9px', width: 42, height: 42 },
      floatPaper: { height: 42, margin: '0 12px' },
      floatBar: { height: 42, padding: '0 6px', alignItems: 'center' },
      toolbar: { height: '0px' },
      timeControl: { height: '0px' }
    };

    if (this.state.toolbarsOpen) {
      styles.toolbar = {};
      if (this.state.timeControlOpen) {
        styles.timeControl = {};
      }
    }

    return styles;
  },

  getClasses() {
    var classes = {
      toolbar: 'closed',
      timeControl: 'closed'
    };

    if (this.state.toolbarsOpen) {
      classes.toolbar = 'open';
      if (this.state.timeControlOpen) {
        classes.timeControl = 'open';
      }
    }

    return classes;
  },

  getButtons() {
    var styles = this.getStyles();

    return {
      floatLeft: [{
        icon: 'undo-variant',
        style: styles.floatCircle
      }],
      floatMiddle: [
        { icon: 'pencil', onClick: doNothing },
        { icon: 'line', onClick: doNothing },
        { icon: 'eraser', onClick: doNothing },
        { icon: 'cursor-move', onClick: doNothing },
        { icon: 'magnify', onClick: doNothing },
        { icon: 'play', onClick: doNothing },
        { icon: 'stop', onClick: doNothing },
        { icon: 'flag-variant', onClick: doNothing },
        { icon: 'content-save', onClick: doNothing },
        { icon: 'help-circle', onClick: doNothing }
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
        { icon: this.state.timeControlOpen ? 'chevron-down' : 'chevron-up',
          onClick: this.toggleTimeControl
        }
      ],
      timeControl: [
        { icon: 'onion-skin', onClick: doNothing },
        { icon: 'rewind', onClick: doNothing },
        { icon: 'skip-previous', onClick: doNothing },
        { render: (i) =>
          <div key={i} className='flex-timeline'>
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
      button.render ? button.render(i) : <IconButton key={i} {...button} />
    );
  },

  renderButtonGroups(groups) {
    return groups.map((group, i) =>
      <div key={i} className='flex-group'>
        { this.renderButtons(group) }
      </div>
    );
  },

  render() {
    var styles = this.getStyles();
    var classes = this.getClasses();
    var buttons = this.getButtons();

    return (
      <div className='Editor'>
        <SvgDisplay lines={LINES} />
        <div className='float-bar'>
          <Spacer/>
          <div className='flex'>
            <Paper circle={true}>
              {
                this.renderButtons(buttons.floatLeft)
              }
            </Paper>
            <Paper style={styles.floatPaper}>
              <Toolbar className='flex-bar' style={styles.floatBar}>
                {
                  this.renderButtons(buttons.floatMiddle)
                }
              </Toolbar>
            </Paper>
            <Paper circle={true}>
              {
                this.renderButtons(buttons.floatRight)
              }
            </Paper>
          </div>
          <Spacer/>
        </div>
        <Paper zDepth={2} className='top-bar'>
          <Toolbar className={'flex-bar top ' + classes.toolbar} style={styles.toolbar}>
            {
              this.renderButtonGroups([buttons.topLeft, buttons.topMiddle, buttons.topRight])
            }
          </Toolbar>
        </Paper>
        <Paper zDepth={2} className='bottom-bar'>
          <Toolbar className={'flex-bar ' + classes.toolbar} style={styles.toolbar}>
            {
              this.renderButtonGroups([buttons.bottomLeft, buttons.bottomMiddle, buttons.bottomRight])
            }
          </Toolbar>
          <Toolbar className={'flex-bar ' + classes.timeControl} style={styles.timeControl}>
            <Spacer/>
            <div className='flex-group flex-time-control'>
              {
                this.renderButtons(buttons.timeControl)
              }
            </div>
            <Spacer/>
          </Toolbar>
        </Paper>
      </div>
    );
  }
});

module.exports = Editor;

