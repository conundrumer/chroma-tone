import SimState from './SimState'
import _ from 'lodash'

export default function removeEntity({balls, wires, collisions}, id) {
  return SimState(_.filter(balls, e => e.id !== id), _.filter(wires, e => e.id !== id), collisions)
}
