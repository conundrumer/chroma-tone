import SimState from './SimState'
import Wire from './Wire'

export default function addWire({balls, wires, collisions}, id, p, q, t) {
  return SimState(balls, [...wires, Wire(id, p, q, t)], collisions)
}
