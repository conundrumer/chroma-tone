export default function jsonWriter(trackData) {
  return JSON.stringify(trackData, null, 1).replace(/^ +/gm, '')
}
