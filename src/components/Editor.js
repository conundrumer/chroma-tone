'use strict';

var React = require('react/addons');
var {IconButton, SvgIcon, Toolbar, ToolbarGroup, DropDownMenu, ToolbarTitle, FontIcon, DropDownIcon, RaisedButton, ToolbarSeparator} = require('material-ui');

var mui = require('material-ui');
var ThemeManager = new mui.Styles.ThemeManager();

//var Actions = require('actions/xxx')

require('styles/Editor.less');

var MdiIconButton = React.createClass({

  render() {
    return (
      <IconButton {...this.props} style={{top: 1}}>
        <FontIcon className={'mdi mdi-' + this.props.icon} />
      </IconButton>
    );
  }

});

// svgs are not aligned with fonts for some reason
// compensating with positioning...
var SvgIconButton = React.createClass({

  render() {
    return (
      <IconButton {...this.props} style={{top: 4}}>
        <SvgIcon>
          {this.props.children}
        </SvgIcon>
      </IconButton>
    );
  }

});

var Editor = React.createClass({

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
        backgroundColor: 'transparent'
      }
    });
  },

  render() {
    return (
        <div className='Editor'>
          <div className='top-bar'>
            <Toolbar>
              <ToolbarGroup key={0}>
                <MdiIconButton icon="cursor-default" />
                <MdiIconButton icon="pencil" />
                <MdiIconButton icon="brush" />
                <SvgIconButton icon="line">
                  <line stroke="black" strokeWidth="3" strokeLinecap="round" x1="20" y1="4" x2="4" y2="20"/>
                </SvgIconButton>
                <SvgIconButton icon="curve">
                  <path fill="none" stroke="black" strokeWidth="2.75" strokeLinecap="round" d="M20,4C7.3,6,19,17,4,20"/>
                </SvgIconButton>
                <SvgIconButton icon="multi-line">
                  <line stroke="black" strokeWidth="2.5" strokeLinecap="round" x1="8" y1="10" x2="20" y2="4"/>
                  <line stroke="black" strokeWidth="2.5" strokeLinecap="round" x1="6" y1="15" x2="17" y2="11"/>
                  <line stroke="black" strokeWidth="2.5" strokeLinecap="round" x1="4" y1="20" x2="14" y2="18"/>
                </SvgIconButton>
                <MdiIconButton icon="eraser" />
                <SvgIconButton icon="cursor-move">
                  <path fill="black" d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z" />
                </SvgIconButton>
                <MdiIconButton icon="magnify" />
                <MdiIconButton icon="content-save" />
                <MdiIconButton icon="layers" />
                <MdiIconButton icon="settings" />
                <MdiIconButton icon="message" />
              </ToolbarGroup>
              <ToolbarGroup key={1} float="right">
                <ToolbarSeparator/>
              </ToolbarGroup>
            </Toolbar>
          </div>
          <div className='bottom-bar'>
            <Toolbar>
              <ToolbarGroup key={0}>
                <MdiIconButton icon="play" />
                <MdiIconButton icon="pause" />
                <MdiIconButton icon="stop" />
                <MdiIconButton icon="skip-next" />
                <MdiIconButton icon="skip-previous" />
                <MdiIconButton icon="fast-forward" />
                <MdiIconButton icon="rewind" />
                <MdiIconButton icon="flag-variant" />
                <MdiIconButton icon="flag-outline-variant" />
                <SvgIconButton icon="viewfinder">
                  <path fill="none" stroke="black" strokeWidth="2.22" strokeLinecap="round" d="M3.1,9.3c7.9,9,8.7,0.6,17.8,3.2"/>
                  <path d="M19.8,17.6H4.2V6.4h15.6 M19.8,4.2H4.2C3,4.2,2,5.2,2,6.4v11.1c0,1.2,1,2.2,2.2,2.2h15.6c1.2,0,2.2-1,2.2-2.2V6.4,C22,5.2,21,4.2,19.8,4.2z"/>
                </SvgIconButton>
                <MdiIconButton icon="video" />
                <MdiIconButton icon="movie" />
                <MdiIconButton icon="music-note" />
              </ToolbarGroup>
              <ToolbarGroup key={1} float="right">
                <ToolbarSeparator/>
              </ToolbarGroup>
            </Toolbar>
          </div>
        </div>
      );
  }
});

module.exports = Editor;

