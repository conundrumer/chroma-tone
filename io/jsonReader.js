import { decompressFromBase64 as decompress } from 'lz-string'

const linesArrayAttr = ['type', 'id', 'x1', 'y1', 'x2', 'y2', 'extended', 'flipped', 'leftLine', 'rightLine']

export default function jsonReader(json) {
  let data = JSON.parse(json)

  if (typeof data.linesArrayCompressed === 'string') {
    data.linesArray = JSON.parse(decompress(data.linesArrayCompressed))
    delete data.linesArrayCompressed
  }
  if (data.linesArray instanceof Array) {
    data.lines = data.linesArray.map(lineData => {
      let line = {}
      linesArrayAttr.forEach((attr, i) => {
        line[attr] = lineData[i]
      })
      return line
    })
    delete data.linesArray
  }
  return data
}
