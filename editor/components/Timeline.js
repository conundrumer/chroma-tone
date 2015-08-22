import React, { PropTypes } from 'react'
import PureComponent from 'react-pure-render/component';
import { Slider } from 'material-ui'
import { setFrameIndex } from '../actions'

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

  onChange(e, value) {
    this.props.dispatch(setFrameIndex(value))
  }

  render() {
    let {
      index,
      flagIndex,
      maxIndex
    } = this.state

    return (
      <div className='timeline'>
        <Slider name='timeline' style={{width: '100%'}} min={0} max={maxIndex + 0.5} value={index} step={1} onChange={(e, v) => this.onChange(e, v)}/>
      </div>
    );
  }
}
