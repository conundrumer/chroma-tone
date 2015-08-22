import React from 'react'

export default class Timeline extends React.Component {
  render() {
    return (
      <div className='timeline'>
        <input type='range' min={0} max={100} defaultValue={0} style={{width: '100%'}} />
      </div>
    );
  }
}
