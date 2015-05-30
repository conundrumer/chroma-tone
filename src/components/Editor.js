'use strict';

var React = require('react/addons');
var mui = require('material-ui');
var ThemeManager = new mui.Styles.ThemeManager();

var {Slider, Toolbar, FontIcon, Paper} = mui;
var MuiIconButton = mui.IconButton;
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

var IconButton = React.createClass({

  getIcon(icon) {
    switch (icon) {
      case 'line':
        return <Line />;
      case 'curve':
        return <Curve />;
      case 'multi-line':
        return <MultiLine />;
      case 'viewfinder':
        return <Viewfinder />;
      case 'cursor-move':
        return <CursorMove />;
      case 'onion-skin':
        return <OnionSkin />;
    }
    return null;
  },

  render() {
    var icon = this.getIcon(this.props.icon);
    if (icon) {
      return (
        <MuiIconButton {...this.props}>
          {icon}
        </MuiIconButton>
      );
    }
    return (
      <MuiIconButton {...this.props}>
        <FontIcon className={'mdi mdi-' + this.props.icon} />
      </MuiIconButton>
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
              <IconButton icon="undo-variant" style={{
                width: 42,
                height: 42,
                padding: '0px'
              }}/>
            </Paper>
            <Paper style={{height: 42, margin: '0 12px'}}>
              <Toolbar className='flex-bar' style={{height: 42, padding: '0 6px', alignItems: 'center'}}>
                <IconButton style={small} icon="pencil" />
                <IconButton icon='line' style={small} />
                <IconButton style={small} icon="eraser" />
                <IconButton icon='cursor-move' style={small} />
                <IconButton style={small} icon="magnify" />
                <IconButton style={small} icon="play" />
                <IconButton style={small} icon="stop" />
                <IconButton style={small} icon="flag-variant" />
                <IconButton style={small} icon="content-save" />
                <IconButton style={small} icon="help-circle" />
              </Toolbar>
            </Paper>
            <Paper circle={true}>
              <IconButton icon="chevron-down" onClick={() => this.setState({toolbarsOpen: true})} style={{
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
                <IconButton icon="content-save" />
                <IconButton icon="undo-variant" />
                <IconButton icon="redo-variant" />
              </div>
              <div className='flex-group'>
                <IconButton icon="cursor-default" />
                <IconButton icon="pencil" />
                <IconButton icon="brush" />
                <IconButton icon='line' />
                <IconButton icon='curve' />
                <IconButton icon='multi-line' />
                <IconButton icon="eraser" />
              </div>
              <div className='flex-group'>
                <IconButton icon="settings" />
                <IconButton icon="message" />
                <IconButton icon="chevron-up" onClick={() => this.setState({toolbarsOpen: false})} />
              </div>
            </Toolbar>
          </Paper>
          <Paper zDepth={2} className='bottom-bar'>
            <Toolbar className={'flex-bar ' + openedClass} style={closedBar}>
              <div className='flex-group'>
                <IconButton icon="layers" />
                <IconButton icon='viewfinder' />
                <IconButton icon='cursor-move' />
                <IconButton icon="magnify" />
              </div>
              <div className='flex-group'>
                <IconButton icon="flag-outline-variant" />
                <IconButton icon="flag-variant" />
                <IconButton icon="play" />
                <IconButton icon="stop" />
                <IconButton icon="pause" />
              </div>
              <div className='flex-group'>
                <IconButton icon="video" />
                <IconButton icon="movie" />
                <IconButton icon="help-circle" />
                <IconButton icon={toggleBottomIcon} onClick={this.toggleBottom} />
              </div>
            </Toolbar>
            <Toolbar className={'flex-bar ' + bottomOpenedClass} style={closedBottom}>
              <div/>
              <div className='flex-group flex-time-control'>
                <IconButton icon='OnionSkin' />
                <IconButton icon="rewind" />
                <IconButton icon="skip-previous" />
                <div className='flex-timeline'>
                  <Slider name="timeline" style={{margin: 0}} />
                </div>
                <IconButton icon="skip-next" />
                <IconButton icon="fast-forward" />
                <IconButton icon="music-note" />
              </div>
              <div/>
            </Toolbar>
          </Paper>
        </div>
      );
  }
});

module.exports = Editor;

