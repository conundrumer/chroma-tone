'use strict';

var _ = require('lodash');
var React = require('react');
var mui = require('material-ui');
var classNames = require('classnames');
var Combokeys = require('combokeys');
var ThemeManager = new mui.Styles.ThemeManager();

var {Paper, Styles: { Colors: { blue500, red500, lightGreen500 }}} = mui;
var IconButton = require('./IconButton');
var { getButtons, getButtonGroups } = require('../buttons');
var DrawingSurface = require('./DrawingSurface');
var { setHotkey } = require('../actions');

require('../styles/Editor.less');

function setTheme() {
  let palette = ThemeManager.getCurrentTheme().palette;
  palette.primary1Color = blue500;
  palette.primary2Color = red500;
  palette.primary3Color = lightGreen500;
  ThemeManager.setPalette(palette);
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
    setTheme();
    this.ripples = Object.create(null);
  },

  setRipple(name, start, end) {
    let ripple = this.ripples[name];
    if (!ripple) {
      ripple = [];
    }
    ripple.push({start, end})

    this.ripples[name] = ripple;
  },

  componentDidMount() {
    this.interval = setInterval(this.onResize, 100);

    // add ripples to indicate hotkey has occured in hidden toolbars
    let buttons = getButtons();
    let bs = getButtonGroups(buttons);
    let float = _.flatten(_.values(bs.float));
    _.forEach(buttons, b => {
      if (!_.contains(float, b)) {
        this.ripples[b.name].push(this.ripples.showToolbars[0]);
      }
    });

    this.combokeys = new Combokeys(document);
    setDefaultHotkeys(this.props.dispatch, this.combokeys, this.ripples);
  },

  // shouldComponentUpdate(nextProps, nextState) {
  //   return false;
  // },

  componentWillUnmount() {
    this.combokeys.detach();
  },

  getTimeline() {
    return {
      render: () => <Timeline />
    };
  },

  getButtonGroups() {
    let b = getButtons(this.props.dispatch);

    b.toggleTimeControl.transform = `rotate(${this.props.timeControlVisible ? 0 : 180}deg)`;

    let bs = getButtonGroups(b);

    let addStyle = style => button => {
      button = _.clone(button);
      button.style = style;
      return button;
    };

    bs.float.left = bs.float.left.map(addStyle(STYLES.floatCircle));
    bs.float.right = bs.float.right.map(addStyle(STYLES.floatCircle));
    bs.float.middle = bs.float.middle.map(addStyle(STYLES.smallIcon));

    _.values(bs.bottom).concat(_.values(bs.timeControl)).forEach(buttonGroup => {
      buttonGroup.forEach(button => {
        button.tooltipPosition = 'top-center';
      });
    });

    _.forEach(bs, buttonGroups => {
      _.forEach(buttonGroups, buttonGroup => {
        _.forEach(buttonGroup, button => {
          button.tooltip = this.props.selected.help ? button.tooltip : null;
          button.selected = this.props.selected[button.name];
          button.setRipple = (startRipple, endRipple) => {
            this.setRipple(button.name, startRipple, endRipple)
          };
        });
      });
    });

    bs.timeControl.middle = [this.getTimeline()];

    return bs;
  },

  isGroupDisabled(toolbar) {
    let {
      toolbarsVisible,
      timeControlVisible
    } = this.props;

    switch (toolbar) {
      case 'float':
        return toolbarsVisible
      case 'top':
      case 'bottom':
        return !toolbarsVisible
      case 'timeControl':
        return !toolbarsVisible || !timeControlVisible
    }
  },

  renderButtons() {
    let bs = this.getButtonGroups();
    return _.mapValues(bs, (buttonGroups, toolbar) =>
      _.mapValues(buttonGroups, (buttonGroup, position) =>
        _.map(buttonGroup, (button, i) =>
          <Button
            key={toolbar + position + i}
            buttonProps={button}
            groupDisabled={this.isGroupDisabled(toolbar)}
          />
        )
      )
    );
  },

  render() {
    let {
      float,
      top,
      bottom,
      timeControl
    } = this.renderButtons();

    let {
      toolbarsVisible,
      timeControlVisible
    } = this.props;

    return (
      <div className='LR-Editor' >
        <DrawingSurface dispatch={this.props.dispatch} />
        <FloatBar closed={toolbarsVisible}>
          { float }
        </FloatBar>
        <TopBar closed={!toolbarsVisible}>
          { top }
        </TopBar>
        <BottomBar
          buttonGroups={bottom}
          closed={!toolbarsVisible}
          timeControlGroup={timeControl}
          timeControlClosed={!timeControlVisible}
        >
          { bottom }
          { timeControl }
        </BottomBar>
      </div>
    );
  }
});

var Timeline = React.createClass({
  render() {
    return (
      <div className='timeline'>
        <input type='range' min={0} max={100} defaultValue={0} style={{width: '100%'}} />
      </div>
    );
  }
})

const DEFAULT_ICON_STYLE = { padding: '9px', width: 42, height: 42, margin: '3px' };

var Button = React.createClass({
  render() {
    let {
      icon,
      boundAction,
      style,
      render,
      ...props
    } = this.props.buttonProps;

    if (render) {
      return render();
    }
    return (
      <IconButton {...props}
        onTouchTap={boundAction}
        style={style || DEFAULT_ICON_STYLE}
        disabled={this.props.groupDisabled || !boundAction}
      >
        { icon }
      </IconButton>
    );
  }
})

var ButtonGroups = React.createClass({
  render() {
    return (
      <Toolbar className={this.props.className}>
        {['left', 'middle', 'right'].map( position =>
          <div key={position} className='toolbar-group'>
            { this.props.children[position] }
          </div>
        )}
      </Toolbar>
    );
  }
})

var FloatBar = React.createClass({

  render() {
    let closed = this.props.closed;
    return (
      <div className='float-container'>
        {this.props.children.left.map( (child, i) =>
          <FloatPaper key={i} className={classNames({closed: closed})} circle={true}>
            { child }
          </FloatPaper>
        )}
        <FloatPaper className={classNames('float-paper-bar', {closed: closed})}>
          <Toolbar className='float-toolbar'>
            { this.props.children.middle }
          </Toolbar>
        </FloatPaper>
        {this.props.children.right.map( (child, i) =>
          <FloatPaper key={-i-1} className={classNames({closed: closed})} circle={true}>
            { child }
          </FloatPaper>
        )}
      </div>
    );
  }
})

var TopBar = React.createClass({

  render() {
    let closed = this.props.closed;
    return (
      <PaperBar className={classNames('top', {closed: closed})}>
        <ButtonGroups className='top'>
          { this.props.children }
        </ButtonGroups>
      </PaperBar>
    );
  }
})

var BottomBar = React.createClass({

  render() {
    let closed = this.props.closed;
    let timeControlClosed = this.props.timeControlClosed;

    let bottomPaperBarClass = !timeControlClosed ? 'bottom-extended' : 'bottom';

    return (
      <PaperBar className={classNames(bottomPaperBarClass, {closed: closed})}>
        <ButtonGroups>
          { this.props.children[0] }
        </ButtonGroups>
        <div className={classNames('toolbar', 'time-control-toolbar', {closed: timeControlClosed})}>
          <div className='toolbar-group time-control'>
            { _.flatten(_.values(this.props.children[1])) }
          </div>
        </div>
      </PaperBar>
    );
  }
})

function blockEvent(e) {
  e.preventDefault();
}

var Toolbar = React.createClass({
  render() {
    return (
      <div
        className={'toolbar ' + (this.props.className || '')}
        onTouchStart={blockEvent}
        onMouseDown={blockEvent}
      >
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
        onTouchStart={blockEvent}
        onMouseDown={blockEvent}
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
        className={classNames('float-paper', this.props.className)}
        circle={this.props.circle}
        style={{boxShadow: 'null'}}
        transitionEnabled={false}
        onTouchStart={blockEvent}
        onMouseDown={blockEvent}
      >
        {this.props.children}
      </Paper>
    );
  }
});

module.exports = Editor;

