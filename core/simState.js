// this could also return a spatial cache but too complicated
export default function simState(balls, wires) {
  return {
    balls,
    wires,
    collisions: []
  }
}
