import stepBall from './stepBall'
import SimState from './simState'

const GRAVITY = { x: 0, y: 0.175 }
const AIR_FRICTION = 0

// should return simState
export default function step(simState) {
  let steppedBalls = simState.balls.map(ball => stepBall(ball, GRAVITY, AIR_FRICTION))
  return SimState(steppedBalls.map(steppedBall => steppedBall.next), simState.wire)
}
