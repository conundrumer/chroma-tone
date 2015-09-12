import stepBall from './stepBall'
import SimState from './SimState'

const GRAVITY = { x: 0, y: 0.175 }
const AIR_FRICTION = 0

// do it naively for now, O(n^2) collision checking, O(n^2 * m) because m iterations for m collisions
// damn that's bad
// also don't check for ball_ball collisions, keep it simple
function getCollisionsNaively() {

}

// should return simState
export default function step(simState) {
  let steppedBalls = simState.balls.map(ball => stepBall(ball, GRAVITY, AIR_FRICTION))
  return SimState(steppedBalls.map(steppedBall => steppedBall.next), simState.wires)
}
