'use strict';

var React = require('react/addons');
var mui = require('material-ui');
var ThemeManager = new mui.Styles.ThemeManager();

var {IconButton, Slider, Toolbar, FontIcon} = mui;
var {Line, Curve, MultiLine, Viewfinder, CursorMove} = require('./SvgIcons');
var SvgDisplay = require('./SvgDisplay');

//var Actions = require('actions/xxx')

require('styles/Editor.less');

function randomLines() {
  var lines = [];
  var limits = 900;
  var getNum = () => Math.random() * limits - 100;
  for (let i = 0; i < 100; i++) {
    lines.push([getNum(), getNum(), getNum(), getNum()]);
  }
  return lines;
}

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

  render() {
    return (
        <div className='Editor'>
          <SvgDisplay lines={randomLines()} />
          <div className='top-bar'>
            <Toolbar className='flex-bar'>
              <div className='flex-group'>
                <MdiIconButton icon="content-save" />
                <MdiIconButton icon="layers" />
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
              </div>
            </Toolbar>
          </div>
          <div className='bottom-bar'>
            <Toolbar className='flex-bar'>
              <div className='flex-group'>
                <IconButton>
                  <Viewfinder/>
                </IconButton>
                <IconButton>
                  <CursorMove/>
                </IconButton>
                <MdiIconButton icon="magnify" />
              </div>
              <div className='flex-group'>
                <MdiIconButton icon="play" />
                <MdiIconButton icon="pause" />
                <MdiIconButton icon="stop" />
                <MdiIconButton icon="flag-variant" />
                <MdiIconButton icon="flag-outline-variant" />
              </div>
              <div className='flex-group'>
                <MdiIconButton icon="video" />
                <MdiIconButton icon="music-note" />
                <MdiIconButton icon="movie" />
              </div>
            </Toolbar>
            <Toolbar className='flex-bar'>
              <div></div>
              <div className='flex-group flex-time-control'>
                <MdiIconButton icon="rewind" />
                <MdiIconButton icon="skip-previous" />
                <div className='flex-timeline'>
                  <Slider name="timeline" style={{margin: 0}} />
                </div>
                <MdiIconButton icon="skip-next" />
                <MdiIconButton icon="fast-forward" />
              </div>
              <div></div>
            </Toolbar>
          </div>
        </div>
      );
  }
});

module.exports = Editor;

