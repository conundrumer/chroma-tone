
function selectCam({w, h, x, y, z}, inPlaybackMode, track, index) {
  if (inPlaybackMode) {
    let offset = 25; // TODO: make this responsive to toolbars
    let maxRadius = Math.max(z * (Math.min(w, h) / 2) - offset)
    ;({x, y} = track.getRiderCam(index, maxRadius))
  }
  return {x, y, z}
}

function selectLines({w, h}, {x, y, z}, track) {
  let [x1, y1, width, height] = [
    x - w / 2 * z,
    y - h / 2 * z,
    w * z,
    h * z
  ]
  return track.getLinesInBox(x1, y1, x1 + width, y1 + height)
}

function selectRider({index, flag}, track) {
  return {
    startPosition: track.getStartPosition(),
    state: track.getRiderStateAtFrame(index),
    flagState: track.getRiderStateAtFrame(flag)
  }
}

function selectSelected({toggled, selectedTool, playback: {state: playbackState}}) {
  return {
    ...toggled,
    [selectedTool]: true,
    [playbackState]: playbackState !== 'stop'
  }
}

function selectEditor({toolbars}, inPlaybackMode, selected) {
  return {...toolbars, inPlaybackMode, selected}
}

function selectFileLoader({fileLoader: {open, loadingFile, error, fileName, tracks}}) {
  return {open, loadingFile, error, fileName, tracks}
}

export default function select(state) {
  let {
    viewport,
    playback,
    trackData,
  } = state
  let inPlaybackMode = playback.state !== 'stop' && playback.state !== 'pause'
  let cam = selectCam(viewport, inPlaybackMode, trackData.track, playback.index)
  return {
    editor: selectEditor(state, inPlaybackMode, selectSelected(state)),
    fileLoader: selectFileLoader(state),
    inPlaybackMode,
    playback,
    cam,
    viewport,
    lines: selectLines(viewport, cam, trackData.track),
    rider: selectRider(playback, trackData.track)
  };
}
