import React, { PropTypes } from 'react'
import { FloatingActionButton } from 'material-ui'
import { selectColor } from '../actions'
import PureComponent from 'react-pure-render/component'

// TODO: refactor ColorPicker
export default class ColorPicker extends PureComponent {

  static get contextTypes() {
    return {
      muiTheme: PropTypes.object
    }
  }

  getStyle() {
    let {
      toolbarsOpen
    } = this.props
    let size = this.context.muiTheme.component.floatingActionButton.miniSize

    return {
      buttonStyle: {
        position: 'relative',
        top: (toolbarsOpen ? 56 : 50) - size / 2,
        margin: '0px 6px'
      }
    }
  }

  render() {
    let {
      selected,
      open,
      dispatch
    } = this.props

    let {
      primary1Color,
      primary2Color,
      primary3Color
    } = this.context.muiTheme.palette;

    let size = this.context.muiTheme.component.floatingActionButton.miniSize;

    let spacer = <div style={{width: size, height: size, borderRadius: '50%'}} />

    let buttonStyle = this.getStyle().buttonStyle

    return (
      <div style={{
        width: '100%',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <FloatingActionButton style={{...buttonStyle, transform: `scale(${!open ? 0 : selected === 0 ? 1.4 : 1})`}} backgroundColor={primary1Color} mini onTouchTap={() => dispatch(selectColor(0))}>
            {spacer}
          </FloatingActionButton>
          <FloatingActionButton style={{...buttonStyle, transform: `scale(${!open ? 0 : selected === 1 ? 1.4 : 1})`}} backgroundColor={primary2Color} mini onTouchTap={() => dispatch(selectColor(1))}>
            {spacer}
          </FloatingActionButton>
          <FloatingActionButton style={{...buttonStyle, transform: `scale(${!open ? 0 : selected === 2 ? 1.4 : 1})`}} backgroundColor={primary3Color} mini onTouchTap={() => dispatch(selectColor(2))}>
            {spacer}
          </FloatingActionButton>
        </div>
      </div>
    )
  }
}
