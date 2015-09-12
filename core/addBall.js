import SimState from './SimState'
import Ball from './Ball'

export default function addBall({balls, wires, collisions}, id, point, vel) {
  return SimState([...balls, Ball(id, point, vel)], wires, collisions)
}
