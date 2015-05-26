'use strict';

var React = require('react/addons');
var mui = require('material-ui');
var ThemeManager = new mui.Styles.ThemeManager();

var {IconButton, Slider, Toolbar, FontIcon, Paper} = mui;
var {Line, Curve, MultiLine, Viewfinder, CursorMove, OnionSkin} = require('./SvgIcons');
var SvgDisplay = require('./SvgDisplay');

//var Actions = require('actions/xxx')

require('styles/Editor.less');

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

var MdiIconButton = React.createClass({

  render() {
    return (
      <IconButton {...this.props}>
        <FontIcon className={'mdi mdi-' + this.props.icon} />
      </IconButton>
    );
  }

});

var Editor = React.createClass({

  getInitialState() {
    return {
      toolbarsOpen: false,
      bottomOpen: false
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

  toggleBottom() {
    this.setState({bottomOpen: !this.state.bottomOpen});
  },

  render() {
    var small = {padding: '9px', width: 42, height: 42};
    var closedBar = {};
    var openedClass = 'open';
    var closedBottom = {};
    var bottomOpenedClass = 'open';
    var toggleBottomIcon = 'chevron-down';

    if (!this.state.bottomOpen) {
      closedBottom = {height: '0px'};
      bottomOpenedClass = 'closed';
      toggleBottomIcon = 'chevron-up';
    }
    if (!this.state.toolbarsOpen) {
      closedBar = {height: '0px'};
      openedClass = 'closed';
      closedBottom = {height: '0px'};
      bottomOpenedClass = 'closed';
      toggleBottomIcon = 'chevron-up';
    }
    return (
        <div className='Editor'>
          <SvgDisplay lines={LINES} />
          <div className='float-bar'>
            <div/>
            <div className='flex'>
            <Paper circle={true}>
              <MdiIconButton icon="undo-variant" style={{
                width: 42,
                height: 42,
                padding: '0px'
              }}/>
            </Paper>
            <Paper style={{height: 42, margin: '0 12px'}}>
              <Toolbar className='flex-bar' style={{height: 42, padding: '0 6px', alignItems: 'center'}}>
                <MdiIconButton style={small} icon="pencil" />
                <IconButton style={small} >
                  <Line/>
                </IconButton>
                <MdiIconButton style={small} icon="eraser" />
                <IconButton style={small}>
                  <CursorMove/>
                </IconButton>
                <MdiIconButton style={small} icon="magnify" />
                <MdiIconButton style={small} icon="play" />
                <MdiIconButton style={small} icon="stop" />
                <MdiIconButton style={small} icon="flag-variant" />
                <MdiIconButton style={small} icon="content-save" />
                <MdiIconButton style={small} icon="help-circle" />
              </Toolbar>
            </Paper>
            <Paper circle={true}>
              <MdiIconButton icon="chevron-down" onClick={() => this.setState({toolbarsOpen: true})} style={{
                width: 42,
                height: 42,
                padding: '0px'
              }}/>
            </Paper>
            </div>
            <div/>
          </div>
          <Paper zDepth={2} className='top-bar'>
            <Toolbar className={'flex-bar top ' + openedClass} style={closedBar}>
              <div className='flex-group'>
                <MdiIconButton icon="content-save" />
                <MdiIconButton icon="undo-variant" />
                <MdiIconButton icon="redo-variant" />
              </div>
              <div className='flex-group'>
                <MdiIconButton icon="cursor-default" />
                <MdiIconButton icon="pencil" />
                <MdiIconButton icon="brush" />
                <IconButton>
                  <Line/>
                </IconButton>
                <IconButton>
                  <Curve/>
                </IconButton>
                <IconButton>
                  <MultiLine/>
                </IconButton>
                <MdiIconButton icon="eraser" />
              </div>
              <div className='flex-group'>
                <MdiIconButton icon="settings" />
                <MdiIconButton icon="message" />
                <MdiIconButton icon="chevron-up" onClick={() => this.setState({toolbarsOpen: false})} />
              </div>
            </Toolbar>
          </Paper>
          <Paper zDepth={2} className='bottom-bar'>
            <Toolbar className={'flex-bar ' + openedClass} style={closedBar}>
              <div className='flex-group'>
                <MdiIconButton icon="layers" />
                <IconButton>
                  <Viewfinder/>
                </IconButton>
                <IconButton>
                  <CursorMove/>
                </IconButton>
                <MdiIconButton icon="magnify" />
              </div>
              <div className='flex-group'>
                <MdiIconButton icon="flag-outline-variant" />
                <MdiIconButton icon="flag-variant" />
                <MdiIconButton icon="play" />
                <MdiIconButton icon="stop" />
                <MdiIconButton icon="pause" />
              </div>
              <div className='flex-group'>
                <MdiIconButton icon="video" />
                <MdiIconButton icon="movie" />
                <MdiIconButton icon="help-circle" />
                <MdiIconButton icon={toggleBottomIcon} onClick={this.toggleBottom} />
              </div>
            </Toolbar>
            <Toolbar className={'flex-bar ' + bottomOpenedClass} style={closedBottom}>
              <div/>
              <div className='flex-group flex-time-control'>
                <IconButton>
                  <OnionSkin />
                </IconButton>
                <MdiIconButton icon="rewind" />
                <MdiIconButton icon="skip-previous" />
                <div className='flex-timeline'>
                  <Slider name="timeline" style={{margin: 0}} />
                </div>
                <MdiIconButton icon="skip-next" />
                <MdiIconButton icon="fast-forward" />
                <MdiIconButton icon="music-note" />
              </div>
              <div/>
            </Toolbar>
          </Paper>
        </div>
      );
  }
});

module.exports = Editor;

