'use strict';

import _ from 'lodash'
import React, { PropTypes } from 'react'
import mui from 'material-ui'
let {
  IconMenu,
  Styles: {
    ThemeManager: MuiThemeManager,
  Colors: {
    blue500,
    red500,
    green500
    }
  }
} = mui
import Combokeys from 'combokeys'

import { getButtons, getButtonGroups, getMenus } from '../buttons'
import MenuItem from 'material-ui/lib/menus/menu-item'
import IconButton from './IconButton'
import DrawingSurface from './DrawingSurface'
import SideBar from './SideBar';
import FileLoader from './FileLoader';
import Timeline from './Timeline'
import FloatBar from './FloatBar'
import BottomBar from './BottomBar'
import TopBar from './TopBar'

import { setHotkey } from '../actions'

import '../styles/Editor.less'

var ThemeManager = new MuiThemeManager();
function setTheme() {
  let palette = ThemeManager.getCurrentTheme().palette;
  palette.primary1Color = blue500;
  palette.primary2Color = red500;
  palette.primary3Color = green500;
  ThemeManager.setPalette(palette);
  ThemeManager.setComponentThemes({
    raisedButton: {
      primaryColor: red500
    },
    menuItem: {
      selectedTextColor: red500
    }
  })
}

function setDefaultHotkeys(dispatch, combokeys, ripples) {
  _.forEach(getButtons(), ({hotkey}, name) => {
    dispatch(setHotkey(combokeys, ripples, name, hotkey));
  });
}

const STYLES = {
  floatCircle: { padding: '0px', width: 42, height: 42 },
  smallIcon: { padding: '6px', width: 36, height: 36, margin: '3px' }
};

const DEFAULT_ICON_STYLE = { padding: '9px', width: 42, height: 42, margin: '3px' };

export default class Editor extends React.Component {

  static get propTypes() {
    return {
      editor: PropTypes.object,
      dispatch: PropTypes.func.isRequired,
      toolbarsOpen: PropTypes.bool.isRequired,
      sidebarOpen: PropTypes.bool.isRequired,
      timeControlOpen: PropTypes.bool.isRequired,
      sidebarSelected: PropTypes.number.isRequired,
      selected: PropTypes.objectOf(PropTypes.bool).isRequired,
      inPlaybackMode: PropTypes.bool.isRequired,
      fileLoader: PropTypes.shape({
        open: PropTypes.bool.isRequired,
        loadingFile: PropTypes.bool.isRequired,
        error: PropTypes.string,
        fileName: PropTypes.string,
        tracks: PropTypes.arrayOf(PropTypes.object)
      }),
      timeline: PropTypes.object.isRequired
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.timeline !== nextProps.timeline) {
      this.refs.timeline.setState(nextProps.timeline)
    }
  }

  shouldComponentUpdate(nextProps) {
    return this.props.editor !== nextProps.editor || this.props.fileLoader !== nextProps.fileLoader;
  }

  static get childContextTypes() {
    return {
      muiTheme: PropTypes.object
    }
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  }

  componentWillMount() {
    setTheme();
    this.ripples = Object.create(null);
  }

  setRipple(name, start, end) {
    let ripple = this.ripples[name];
    if (!ripple) {
      ripple = [];
    }
    ripple.push({start, end})

    this.ripples[name] = ripple;
  }

  componentDidMount() {
    // add ripples to indicate hotkey has occured in hidden toolbars
    let buttons = getButtons();
    let bs = getButtonGroups(buttons);
    let float = _.flatten(_.values(bs.float));
    _.forEach(buttons, b => {
      if (b.name in this.ripples && !_.contains(float, b)) {
        this.ripples[b.name].push(this.ripples.showToolbars[0]);
      }
    });

    this.combokeys = new Combokeys(document);
    setDefaultHotkeys(this.props.dispatch, this.combokeys, this.ripples);
  }

  componentWillUnmount() {
    this.combokeys.detach();
  }

  getTimeline() {
    return {
      render: (key) => <Timeline ref='timeline' {...this.props.timeline} dispatch={this.props.dispatch} key={key} />
    };
  }

  getButtonGroups() {
    let {
      dispatch,
      timeControlOpen,
      inPlaybackMode
    } = this.props

    let b = getButtons(dispatch);

    b.toggleTimeControl.transform = `rotate(${timeControlOpen ? 0 : 180}deg)`;

    ['undo', 'redo', 'select', 'pencil', 'brush', 'line', 'curve', 'multiLine', 'eraser'].forEach( tool => {
      b[tool].disabled = inPlaybackMode;
    });

    let bs = getButtonGroups(b);

    let addStyle = style => button => {
      button = _.clone(button);
      button.style = style;
      return button;
    };

    bs.float.left = bs.float.left.map(addStyle(STYLES.floatCircle));
    bs.float.right = bs.float.right.map(addStyle(STYLES.floatCircle));
    bs.float.middle = bs.float.middle.map(addStyle(STYLES.smallIcon));

    ['bottom', 'timeControl'].forEach( toolbar => {
      _.flatten(_.values(bs[toolbar])).forEach(button => {
        button.tooltipPosition = 'top-center';
      });
    });

    bs.timeControl.middle = [this.getTimeline()];

    return {buttonGroups: bs, menus: getMenus(b)};
  }

  renderButton({ name, tooltip, icon, boundAction, style, render, disabled, ...props }, key) {
    if (render) {
      return render(key);
    }
    return (
      <IconButton {...props}
        key={key}
        onTouchTap={boundAction}
        style={style || DEFAULT_ICON_STYLE}
        disabled={disabled || !boundAction}
        tooltip={this.props.selected.help ? tooltip : null}
        selected={this.props.selected[name]}
        setRipple={(start, end) => this.setRipple(name, start, end)}
      >
        { icon }
      </IconButton>
    );
  }

  renderMenuButton(button, key, menuItems, openDirection) {
    return (
      <IconMenu
        key={key}
        iconButtonElement={this.renderButton(button, key)}
        openDirection={openDirection}
        desktop={true}
      >
        {menuItems.map(({icon: ItemIcon, tooltip, boundAction}, i) =>
          <MenuItem
            key={i}
            leftIcon={<ItemIcon/>}
            primaryText={tooltip}
            onTouchTap={boundAction}
            disabled={!boundAction}
          />
        )}
      </IconMenu>
    );
  }

  renderButtons() {
    let {buttonGroups: bs, menus} = this.getButtonGroups();
    return _.mapValues(bs, (buttonGroups, toolbar) =>
      _.mapValues(buttonGroups, (buttonGroup, position) =>
        _.map(buttonGroup, (button, i) => {
          let key = toolbar + position + i;
          if (button.name in menus) {
            let {items, openDirection} = menus[button.name];
            return this.renderMenuButton(button, key, items, openDirection);
          }
          return this.renderButton(button, key);
        })
      )
    );
  }

  render() {
    let {
      float,
      top,
      bottom,
      timeControl
    } = this.renderButtons();

    let {
      dispatch,
      toolbarsOpen,
      timeControlOpen,
      sidebarOpen,
      sidebarSelected,
      fileLoader
    } = this.props

    return (
      <div className='LR-Editor' >
        <DrawingSurface dispatch={dispatch} />
        <FloatBar closed={toolbarsOpen}>
          { float }
        </FloatBar>
        <SideBar {...{toolbarsOpen, timeControlOpen}}
          dispatch={dispatch}
          open={sidebarOpen}
          selected={sidebarSelected}
          fileName={fileLoader.fileName}
          tracks={fileLoader.tracks}
        />
        <TopBar closed={!toolbarsOpen}>
          { top }
        </TopBar>
        <BottomBar
          buttonGroups={bottom}
          closed={!toolbarsOpen}
          timeControlGroup={timeControl}
          timeControlClosed={!timeControlOpen}
        >
          { bottom }
          { timeControl }
        </BottomBar>
        <FileLoader {...fileLoader} dispatch={dispatch} />
      </div>
    );
  }
}
