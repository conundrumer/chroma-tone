const linesArrayAttr = ['type', 'id', 'x1', 'y1', 'x2', 'y2', 'extended', 'flipped', 'leftLine', 'rightLine']

export default function jsonReader(json) {
  let data = JSON.parse(json)
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
  // TODO: don't put in array
  return [data]
}
