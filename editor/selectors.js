import _ from 'lodash'
import { createSelector } from 'reselect';
import { jsonWriter } from 'io'
// import { getTrackFromCache } from './trackCacheMiddleware'

const createSelectorFromProps = (reducer, props) =>
  createSelector(
    props.map(prop =>
      state => state[reducer][prop]
    ),
    (...args) => {
      let out = {}
      props.forEach((prop, i) =>
        out[prop] = args[i]
      )
      return out
    }
  )

const inPlaybackModeSelector = ({playback: {state}}) => state !== 'stop' && state !== 'pause'

// track gets mutated but startPosition and lineStore are immutable
// const trackSelector = createSelectorFromProps('trackData', ['track', 'startPosition', 'lineStore'])
// const trackSelector = createSelector(
//   [
//     state => state.trackData.startPosition,
//     state => state.trackData.lineStore
//   ],
//   // the track from cache is derived purely from startPosition and lineStore
//   (startPosition, lineStore) => ({
//     track: getTrackFromCache(null, lineStore, startPosition),
//     startPosition,
//     lineStore
//   })
// )
const viewportSelector = createSelectorFromProps('viewport', ['w', 'h', 'x', 'y', 'z'])
const widthHeightSelector = createSelectorFromProps('viewport', ['w', 'h'])
const fileLoaderSelector = createSelectorFromProps('fileLoader', ['open', 'loadingFile', 'error', 'fileName', 'tracks'])
const toolbarSelector = createSelectorFromProps('toolbars', ['toolbarsOpen', 'timeControlOpen', 'sidebarOpen', 'sidebarSelected', 'colorSelected'])
const openToolbarSelector = createSelectorFromProps('toolbars', ['toolbarsOpen', 'timeControlOpen', 'sidebarOpen'])

// TODO: instead of making the radius smaller, change the viewport itself
const TOOLBAR_HEIGHT = 56
const PAPERBAR_HEIGHT = 48
const OFFSET = 15
export const playbackCamSelector = createSelector(
  [
    openToolbarSelector,
    viewportSelector,
    state => state.playback.index,
    // trackSelector
  ],
  ({toolbarsOpen, timeControlOpen, sidebarOpen}, {w, h, z}, index, /*{track}*/) => {
    h = h - 2 * (toolbarsOpen ? TOOLBAR_HEIGHT * (timeControlOpen ? 2 : 1) : PAPERBAR_HEIGHT)
    let maxRadius = Math.max(z * (Math.min(w, h) / 2) - OFFSET, 0)
    let {x, y} = track.getRiderCam(index, maxRadius)
    return {x, y, z}
  }
)

const camSelector = createSelector(
  [
    viewportSelector,
    state => null //inPlaybackModeSelector(state) ? playbackCamSelector(state) : null
  ],
  ({x, y, z}, playbackCam) => {
    if (playbackCam) {
      return playbackCam
    }
    return {x, y, z}
  }
)

// const lineSelector = createSelector(
//   [
//     state => state.viewport.w,
//     state => state.viewport.h,
//     camSelector,
//     trackSelector
//   ],
//   (w, h, {x, y, z}, {track}) => {
//     let [x1, y1, width, height] = [
//       x - w / 2 * z,
//       y - h / 2 * z,
//       w * z,
//       h * z
//     ]
//     return track.getLinesInBox(x1, y1, x1 + width, y1 + height)
//   }
// )

const indexSelector = createSelector(
  [
    state => state.playback.index,
    state => state.playback.flag,
  ],
  (index, flagIndex) => ({
    index,
    flagIndex,
    startIndex: Math.min(index, flagIndex),
    endIndex: Math.max(index, flagIndex)
  })
)
// const riderSelector = createSelector(
//   [
//     indexSelector,
//     trackSelector
//   ],
//   ({index, flagIndex, startIndex, endIndex}, {track}) => ({
//     startPosition: track.getStartPosition(),
//     rider: track.getRiderStateAtFrame(index),
//     flagRider: track.getRiderStateAtFrame(flagIndex),
//     states: _.range(startIndex, endIndex + 1)
//       .map(i => track.getRiderStateAtFrame(i))
//   })
// )

const colorPickerOpenSelector = state => {
  switch (state.selectedTool) {
    case 'pencil':
    case 'line':
    case 'curve':
    case 'brush':
    case 'multiLine':
      return true
    default:
      return false
  }
}

const selectedSelector = createSelector(
  [
    state => state.toggled,
    state => state.selectedTool,
    state => state.playback.state
  ],
  (toggled, selectedTool, playbackState) => ({
    ...toggled,
    [selectedTool]: true,
    [playbackState]: playbackState !== 'stop'
  })
)

const editorSelector = createSelector(
  [
    toolbarSelector,
    inPlaybackModeSelector,
    selectedSelector,
    colorPickerOpenSelector
  ],
  (toolbars, inPlaybackMode, selected, colorPickerOpen) => ({
    ...toolbars,
    inPlaybackMode,
    selected,
    colorPickerOpen: colorPickerOpen && !inPlaybackMode
  })
)

const timelineSelector = createSelector(
  [
    state => state.playback.index,
    state => state.playback.flag,
    state => state.playback.maxIndex
  ],
  (index, flagIndex, maxIndex) => ({index, flagIndex, maxIndex})
)
// TODO: make sidebar selector
// TODO: move rendering button logic to here
const viewOptionsSelector = createSelector(
  [
    inPlaybackModeSelector
  ],
  (inPlaybackMode) => ({
    color: !inPlaybackMode,
    floor: true,
    accArrow: true
  })
)

const lineSelectionSelector = createSelector(
  [
    state => state.simStatesData.simStates,
    state => state.lineSelection.lineID,
    state => state.selectedTool
  ],
  (simStates, lineID, tool) => {
    if (tool !== 'select') {
      return []
    }
    if (lineID != null) {
      let simState = simStates[0]
      let line = _.filter(simState.balls.concat(simState.wires), {id: lineID})[0]
      if (line != null) {
        if (!line.q) {
          return [{...line,
            q: line.p
          }]
        }
        return [line]
      }
    }
    return []
  }
)

const entitySelector = createSelector(
  [
    indexSelector,
    state => state.simStatesData.simStates
  ],
  ({index}, simStates) => ({
    initBalls: simStates[0].balls,
    balls: simStates[index].balls,
    wires: simStates[index].wires,
    collisions: simStates[index].collisions
  })
)

const displaySelector = createSelector(
  [
    timelineSelector,
    indexSelector,
    // riderSelector,
    camSelector,
    // lineSelector,
    widthHeightSelector,
    viewOptionsSelector,
    state => state.toggled.onionSkin || false,
    entitySelector,
    lineSelectionSelector
  ],
  ({index, flagIndex, maxIndex}, {startIndex, endIndex}, /*{startPosition, states, rider, flagRider}, */cam, /*lines,*/ {w, h}, viewOptions, onionSkin, entities, lineSelection) => ({
    frame: index,
    flagIndex,
    maxIndex,
    // startPosition,
    // rider,
    // flagRider,
    // riders: states,
    startIndex,
    endIndex,
    cam,
    // lines,
    width: w,
    height: h,
    viewOptions,
    onionSkin,
    entities,
    lineSelection
  })
)

const trackSaverSelector = createSelector(
  [
    state => state.simStatesData.simStates,
    state => state.trackSaver.open
  ],
  (simStates, open) => {
    let {balls, wires} = simStates[0]
    let trackData = open ? {balls, wires} : null
    let label = 'untitled'
    let trackSaver = {
      open,
      trackData,
      label,
      fileName: (label || 'untitled') + '.json'
    }
    if (trackData) {
      let trackDataJSON = jsonWriter(trackData) // TODO: this is slow af
      let blob = new Blob([trackDataJSON], {type: 'application/json'})
      trackSaver.trackDataURI = URL.createObjectURL(blob)
      trackSaver.trackDataJSON = (blob.size > 500000) ? // 500 kb
        (label + ': too long to preview raw data :O') : trackDataJSON
    }
    return trackSaver
  }
)

const drawingSurfaceSelector = createSelector(
  [
    state => state.drawStreamActive
  ],
  (drawStreamActive) => ({drawStreamActive})
)

export default createSelector(
  [
    editorSelector,
    fileLoaderSelector,
    timelineSelector,
    displaySelector,
    widthHeightSelector,
    trackSaverSelector,
    drawingSurfaceSelector
  ],
  (editor, fileLoader, timeline, display, widthHeight, trackSaver, drawingSurface) => ({
    editor,
    fileLoader,
    timeline,
    display,
    widthHeight,
    trackSaver,
    drawingSurface
  })
)
