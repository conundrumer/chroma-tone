import Vec2 from './Vec2'

const DEFAULT_RADIUS = 4
const DEFAULT_BOUNCINESS = 1
const DEFAULT_MASS = 1

// balls have bounciness 1 and mass 1
export default function Ball(id, pInit, vInit = Vec2(0, 0)) {
  return {
    id,
    p: pInit,
    v: vInit,
    r: DEFAULT_RADIUS,
    m: DEFAULT_MASS,
    b: DEFAULT_BOUNCINESS
  }
}
