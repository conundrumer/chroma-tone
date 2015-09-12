// this could also return a spatial cache but too complicated
export default function SimState(balls, wires, collisions = []) {
  return {
    balls,
    wires,
    collisions
  }
}
