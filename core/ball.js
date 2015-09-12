import vector from './vector'

const DEFAULT_RADIUS = 2
const DEFAULT_BOUNCINESS = 1
const DEFAULT_MASS = 1

// balls have bounciness 1 and mass 1
export default function ball(pInit, vInit = vector(0, 0)) {
  return {
    p: pInit,
    v: vInit,
    r: DEFAULT_RADIUS,
    m: DEFAULT_MASS,
    b: DEFAULT_BOUNCINESS
  }
}
