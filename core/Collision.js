export const CollisionType = {
  BALL_BALL: 0,
  BALL_WIRE: 1
}

export default function Collision(type, [entityA, entityB], toi, force, position = 0) {
  return {
    type,
    entities: [entityA, entityB],
    toi,
    force,
    position
  }
}
