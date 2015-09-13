import React, { PropTypes } from 'react'
import { FloatingActionButton } from 'material-ui'
import { selectColor } from '../actions'
import PureComponent from 'react-pure-render/component'

import '../styles/ColorPicker.less'

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
        margin: '0px 6px',
        pointerEvents: 'auto'
      }
    }
  }

  render() {
    let {
      selected,
      open,
      dispatch
    } = this.props

    let size = this.context.muiTheme.component.floatingActionButton.miniSize;

    let spacer = <div style={{width: size, height: size, borderRadius: '50%'}} />

    let buttonStyle = this.getStyle().buttonStyle

    let colors = [
      'white',
      'grey',
      'black'
    ]

    return (
      <div className='ColorPicker'>
        <div>
          {[0, 1, 2].map(i =>
            <FloatingActionButton
              key={i}
              style={{...buttonStyle,
                transform: `scale(${!open ? 0 : selected === i ? 1.4 : 1})`
              }}
              backgroundColor={colors[i]}
              mini
              onTouchTap={() => dispatch(selectColor(i))}
            >
              {i === 0 ? <div style={{width: size, height: size, borderRadius: '50%'}} /> : spacer}
            </FloatingActionButton>
          )}
        </div>
      </div>
    )
  }
}
