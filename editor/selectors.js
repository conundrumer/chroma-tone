import { createSelector } from 'reselect';

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
const trackSelector = createSelectorFromProps('trackData', ['track', 'startPosition', 'lineStore'])
const viewportSelector = createSelectorFromProps('viewport', ['w', 'h', 'x', 'y', 'z'])
const widthHeightSelector = createSelectorFromProps('viewport', ['w', 'h'])
const fileLoaderSelector = createSelectorFromProps('fileLoader', ['open', 'loadingFile', 'error', 'fileName', 'tracks'])

const camSelector = createSelector(
  [
    viewportSelector,
    state => inPlaybackModeSelector(state) ? state.playback.index : -1,
    trackSelector
  ],
  ({w, h, x, y, z}, index, {track}) => {
    if (index > -1) {
      let offset = 25; // TODO: make this responsive to toolbars
      let maxRadius = Math.max(z * (Math.min(w, h) / 2) - offset)
      ;({x, y} = track.getRiderCam(index, maxRadius))
    }
    return {x, y, z}
  }
)

const lineSelector = createSelector(
  [
    state => state.viewport.w,
    state => state.viewport.h,
    camSelector,
    trackSelector
  ],
  (w, h, {x, y, z}, {track}) => {
    let [x1, y1, width, height] = [
      x - w / 2 * z,
      y - h / 2 * z,
      w * z,
      h * z
    ]
    return track.getLinesInBox(x1, y1, x1 + width, y1 + height)
  }
)

const riderSelector = createSelector(
  [
    state => state.playback.index,
    state => state.playback.flag,
    trackSelector
  ],
  (index, flag, {track}) => ({
    startPosition: track.getStartPosition(),
    state: track.getRiderStateAtFrame(index),
    flagState: track.getRiderStateAtFrame(flag)
  })
)

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
    state => state.toolbars,
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

const displaySelector = createSelector(
  [
    timelineSelector,
    riderSelector,
    camSelector,
    lineSelector,
    widthHeightSelector,
    viewOptionsSelector
  ],
  ({index, flagIndex, maxIndex}, {startPosition, state, flagState}, cam, lines, {w, h}, viewOptions) => ({
    frame: index,
    flagIndex,
    maxIndex,
    startPosition,
    rider: state,
    flagRider: flagState,
    cam,
    lines,
    width: w,
    height: h,
    viewOptions
  })
)

export default createSelector(
  [
    editorSelector,
    fileLoaderSelector,
    timelineSelector,
    displaySelector,
    widthHeightSelector
  ],
  (editor, fileLoader, timeline, display, widthHeight) => ({
    editor,
    fileLoader,
    timeline,
    display,
    widthHeight
  })
)
