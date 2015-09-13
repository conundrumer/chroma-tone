const DEFAULT_RADIUS = 2
const DEFAULT_TENSION = 1 // higher tension => higher pitch + more brightness + more bounce

export default function Wire(id, p, q, t = DEFAULT_TENSION) {
  return {
    id,
    p,
    q,
    r: DEFAULT_RADIUS,
    t
  }
}
