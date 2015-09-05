import React, { PropTypes } from 'react'
import PureComponent from 'react-pure-render/component';
import Slider from 'react-slider'
import { setFrameIndex, setFrameMaxIndex, setFlag } from '../actions'
import {Flag, StartFlag, TimelineCursor} from './SvgIcons'
import FlagCheckered from 'icons/flag-checkered'

import '../styles/Timeline.less'

export default class Timeline extends PureComponent {

  static get propTypes() {
    return {
      dispatch: PropTypes.func.isRequired,
      index: PropTypes.number.isRequired,
      flagIndex: PropTypes.number.isRequired,
      maxIndex: PropTypes.number.isRequired,
    }
  }

  constructor() {
    super()
    this.state = {
      index: 0,
      flagIndex: 0,
      maxIndex: 0
    }
  }

  componentDidMount() {
    let {index, flagIndex, maxIndex} = this.props
    this.setState({index, flagIndex, maxIndex})
  }

  onChange([index, maxIndex]) {
    if (this.state.index !== index) {
      this.props.dispatch(setFrameIndex(index))
    }
  }

  onAfterChange([index, maxIndex]) {
    if (this.state.maxIndex !== maxIndex) {
      this.props.dispatch(setFrameMaxIndex(maxIndex))
    }
  }

  onFlagChange(v) {
    this.props.dispatch(setFlag(v))
  }

  render() {
    let {
      index,
      flagIndex,
      maxIndex
    } = this.state

    return (
      <div className='timeline'>
        <Slider className='flag-slider' handleClassName='flag' min={0} max={maxIndex} value={0} disabled>
          <StartFlag color='grey' />
        </Slider>
        <Slider className='flag-slider' handleClassName='flag' min={0} max={maxIndex} value={flagIndex} onChange={v => this.onFlagChange(v)}>
          <Flag/>
        </Slider>
        <Slider value={[index, maxIndex]} min={0} max={maxIndex}
          onChange={vs => this.onChange(vs)}
          onAfterChange={vs => this.onAfterChange(vs)}
        >
          <div><TimelineCursor/></div>
          <div><FlagCheckered/></div>
        </Slider>
      </div>
    );
  }
}
