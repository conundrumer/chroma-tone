import vec from './vector'
import ball from './ball'
import wire from './wire'
import simState from './simState'
import collision, {CollisionType} from './collision'
import step from './step'

console.log(vec(1, 2))
console.log(ball(vec(0, 1), vec(2, 3)))
console.log(wire(vec(0, 0), vec(1, 1)))
console.log(simState([ball(vec(0, 1)), ball(vec(2, 3))], [wire(vec(0, 0), vec(0, 1)), wire(vec(1, 0), vec(1, 1))]))
console.log(collision(CollisionType.BALL_BALL, [ball(vec(0, 1)), ball(vec(2, 3))], 0.4))
console.log(collision(CollisionType.BALL_WIRE, [ball(vec(0, 1)), wire(vec(0, 0), vec(0, 1))], 1.3, 0.3))

export {vec, ball, wire, simState, collision, CollisionType, step}
