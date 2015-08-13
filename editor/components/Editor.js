'use strict';

var _ = require('lodash');
var React = require('react');
var Combokeys = require('combokeys');
var mui = require('material-ui');
var classNames = require('classnames');
var ThemeManager = new mui.Styles.ThemeManager();

var {Paper, Styles: { Colors: { blue500, red500, lightGreen500 }}} = mui;
var IconButton = require('./IconButton');
var { getButtons, getButtonGroups } = require('../buttons');
var DrawingSurface = require('./DrawingSurface');

require('../styles/Editor.less');

function setTheme() {
  let palette = ThemeManager.getCurrentTheme().palette;
  palette.primary1Color = blue500;
  palette.primary2Color = red500;
  palette.primary3Color = lightGreen500;
  ThemeManager.setPalette(palette);
}

var STYLES = {
  floatCircle: { padding: '0px', width: 42, height: 42 },
  smallIcon: { padding: '6px', width: 36, height: 36, margin: '3px' },
  defaultIcon: { padding: '9px', width: 42, height: 42, margin: '3px' }
};

var Editor = React.createClass({

  getInitialState() {
    return {
      debugButtons: false,
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
    setTheme();
  },

  componentWillUnmount() {
    this.state.combokeys.detach();
  },

  getTimeline() {
    return {
      render: (i) =>
      <div key={i} className='timeline'>
        <input type='range' min={0} max={100} defaultValue={0} style={{width: '100%'}} />
      </div>
    };
  },

  getButtonGroups() {
    let b = getButtons();

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

    bs.timeControl.middle = [this.getTimeline()];

    return bs;
  },

  renderButton(props, i, disabled = false) {
    let {name, icon, tooltip, action, style, hotkey, render, transform} = props;
    if (render) {
      return render(i);
    }
    if (this.state.debugButtons) {
      return (
        <button key={i} style={{width: 48, height: 48, padding: 0}} {...props} />
      );
    }
    return (
      <IconButton
        key={i}
        onTouchTap={ action ? () => this.props.dispatch(action) : null}
        style={style || STYLES.defaultIcon}
        combokeys={this.state.combokeys}
        tooltip={this.props.selected.help ? tooltip : null}
        selected={this.props.selected[name]}
        disabled={disabled || !action}
        hotkey={hotkey}
        transform={transform}
      >
        { icon }
      </IconButton>
    );
  },

  renderButtons(buttons, disabled) {
    return buttons.map((button, i) => this.renderButton(button, i, disabled));
  },

  renderButtonGroups(groups, disabled) {
    return ['left', 'middle', 'right'].map( position =>
      <div key={position} className='toolbar-group'>
        { this.renderButtons(groups[position], disabled) }
      </div>
    );
  },

  renderFloatBar(float) {
    let closed = this.props.toolbarsVisible;

    let makeFloatCircle = (button, i) => ({
      className: classNames({closed: closed}),
      circle: true,
      key: i,
      children: this.renderButton(button, closed)
    });

    let floatPapersProps = float.left.map(makeFloatCircle)
    .concat([{
      className: classNames('float-paper-bar', {closed: closed}),
      children:
        <Toolbar className='float-toolbar'>
          { this.renderButtons(float.middle, closed) }
        </Toolbar>
    }]).concat(float.right.map(makeFloatCircle));

    return (
      <div className='float-container'>
        {floatPapersProps.map((props, i) =>
          <div key={i}>
            <FloatPaper {...props}>
              { props.children }
            </FloatPaper>
          </div>
        )}
      </div>
    );
  },

  renderTopBar(top) {
    let closed = !this.props.toolbarsVisible;
    return (
      <PaperBar className={classNames('top', {closed: closed})}>
        <Toolbar className='top'>
          { this.renderButtonGroups(top, closed) }
        </Toolbar>
      </PaperBar>
    );
  },

  renderBottomBar(bottom, timeControl) {
    timeControl = _.flatten(['left', 'middle', 'right'].map(pos => timeControl[pos]));

    let closed = !this.props.toolbarsVisible;
    let timeControlClosed = !this.props.timeControlVisible;

    let bottomPaperBarClass = !timeControlClosed ? 'bottom-extended' : 'bottom';

    return (
      <PaperBar className={classNames(bottomPaperBarClass, {closed: closed})}>
        <Toolbar>
          { this.renderButtonGroups(bottom, closed) }
        </Toolbar>
        <div className={classNames('toolbar', 'time-control-toolbar', {closed: timeControlClosed})}>
          <div className='toolbar-group time-control'>
            { this.renderButtons(timeControl, timeControlClosed) }
          </div>
        </div>
      </PaperBar>
    );
  },

  render() {
    let {
      float,
      top,
      bottom,
      timeControl
    } = this.getButtonGroups();

    return (
      <div className='LR-Editor' >
        <DrawingSurface dispatch={this.props.dispatch} />
        { this.renderFloatBar(float) }
        { this.renderTopBar(top) }
        { this.renderBottomBar(bottom, timeControl) }
      </div>
    );
  }
});

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

