import Vec2 from './Vec2'
import Ball from './Ball'
import Wire from './Wire'
import SimState from './SimState'
import {CollisionType} from './Collision'
import step from './step'

import addBall from './addBall'
import addWire from './addWire'
import removeEntity from './removeEntity'
import getClosestEntity, {getDistanceFromWire} from './getClosestEntity'

// let testSimState = SimState([Ball(Vec2(0, 1), Vec2(1, 0)), Ball(Vec2(2, 3), Vec2(3, 2))], [Wire(Vec2(0, 0), Vec2(0, 1)), Wire(Vec2(1, 0), Vec2(1, 1))])
// console.log('step', JSON.stringify(testSimState, null, 1), JSON.stringify(step(testSimState), null, 1))

export {Vec2, Ball, Wire, SimState, CollisionType, step, addBall, addWire, removeEntity, getClosestEntity, getDistanceFromWire}
