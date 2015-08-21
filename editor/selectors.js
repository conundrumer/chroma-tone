
function selectCam({w, h, x, y, z}, playing, track, index) {
  if (playing) {
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

export default function select({
  toolbars,
  selectedTool,
  toggled,
  viewport,
  playback,
  trackData,
  ...state
}) {
  let playing = playback.state !== 'stop' && playback.state !== 'pause'
  let cam = selectCam(viewport, playing, trackData.track, playback.index)
  return {...state,
    toolbars,
    selected: {
      ...toggled,
      [selectedTool]: true,
      [playback.state]: playback.state !== 'stop'
    },
    playing,
    playback,
    cam,
    viewport,
    lines: selectLines(viewport, cam, trackData.track),
    rider: selectRider(playback, trackData.track)
  };
}
