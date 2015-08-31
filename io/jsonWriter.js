import { compressToBase64 as compress } from 'lz-string'

function isSolid(type) {
  return type === 0 || type === 1;
}

function makeLinesArray(lines) {
  return lines.map(({type, id, x1, y1, x2, y2, extended, flipped, leftLine, rightLine}) => {
    let data = [type, id, x1, y1, x2, y2]
    if (isSolid(type)) {
      data = data.concat([extended, flipped | 0])
      if (leftLine) {
        data[8] = leftLine
      }
      if (rightLine) {
        data[8] = typeof data[8] === 'number' ? data[8] : null
        data[9] = rightLine
      }
    }
    return data
  })
}

function toString(trackData, spaces = 1) {
  return JSON.stringify(trackData, null, spaces).replace(/^ +/gm, '')
}

export default function jsonWriter(trackData) {
  let json = toString(trackData)
  if (json.length > 500000) { // 500 kb
    let lines = trackData.lines
    let linesArray = makeLinesArray(lines)
    delete trackData.lines
    trackData.linesArray = linesArray
    json = toString(trackData)
    if (json.length > 500000) { // 500 kb
      delete trackData.linesArray
      trackData.linesArrayCompressed = compress(JSON.stringify(linesArray))
      json = toString(trackData)
    }
  }
  return json
}
