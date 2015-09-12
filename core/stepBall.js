import Ball from './Ball'

export default function stepBall(ball, gravity, airFriction) {
  let nextV = ball.v.clone().add(gravity).mulS(1 - airFriction)
  return {
    cur: ball,
    next: Ball(ball.p.clone().add(nextV), nextV)
  }
}
