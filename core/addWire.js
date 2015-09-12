import SimState from './SimState'
import Wire from './Wire'

export default function addWire({balls, wires, collisions}, id, p, q) {
  return SimState(balls, [...wires, Wire(id, p, q)], collisions)
}
