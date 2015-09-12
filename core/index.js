import vec from './vector'
import ball from './ball'
import wire from './wire'
import simState from './simState'
import {CollisionType} from './collision'
import step from './step'

let testSimState = simState([ball(vec(0, 1), vec(1, 0)), ball(vec(2, 3), vec(3, 2))], [wire(vec(0, 0), vec(0, 1)), wire(vec(1, 0), vec(1, 1))])
console.log('step', JSON.stringify(testSimState, null, 1), JSON.stringify(step(testSimState), null, 1))

export {vec, ball, wire, simState, CollisionType, step}
