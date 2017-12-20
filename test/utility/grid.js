#!/usr/bin/env node

const assert = require('assert');

const grid = require('../../utility/grid/index.js');

assert.equal(grid.adjacent({x:4,y:11}, {x:4,y:12}), true);
assert.equal(grid.adjacent({x:5,y:11}, {x:4,y:11}), true);
assert.equal(grid.adjacent({x:5,y:11}, {x:6,y:12}), false);

assert.equal(grid.sameSpot({x:9,y:3},{x:9,y:3}), true);
assert.equal(grid.sameSpot({x:9,y:3},{x:3,y:9}), false);
assert.equal(grid.sameSpot({x:1,y:2},{x:3,y:4}), false);

assert.equal(grid.distance({x: 5, y: 5}, {x: 8, y: 9}), 5.0);
assert.equal(grid.fastDistance({x: 5, y: 5}, {x: 8, y: 9}), 4);

assert.equal(grid.sameSpot({x: 17, y: 17}, {x: 17, y: 17}), true);
assert.equal(grid.sameSpot({x: 17, y: 17}, {x: 17, y: 18}), false);
assert.equal(grid.sameSpot({x: 1, y: 2}, {x: 2, y: 1}), false);

assert.deepEqual(grid.ahead({x: 5, y: 7}, 'north', 3), {x: 5, y: 4});
assert.deepEqual(grid.ahead({x: 3, y: 8}, 'west'), {x: 2, y: 8});

try {
  let result = grid.ahead({x:1,y:2}, 'shit');
  assert.notOk(result);
} catch(e) {
  assert(e instanceof TypeError);
}
