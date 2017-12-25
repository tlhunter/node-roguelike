#!/usr/bin/env node

const assert = require('assert');

const GridCollection = require('../../utility/gridCollection/index.js');

const gc = new GridCollection();

const dog = {name: 'Snoopy'};
const cat = {name: 'Felix'};
const mouse = {name: 'Mickey'};

assert.equal(gc.has({x: 1, y: 2}), false, 'no entries yet');
assert.equal(gc.size(), 0, 'no entries');

assert.equal(gc.add({x: 1, y: 2}, dog), true, 'should insert');
assert.equal(gc.add({x: 1, y: 3}, cat), true, 'should insert');
assert.equal(gc.add({x: 1, y: 3}, mouse), false, 'no insert, something at coordinate');
assert.equal(gc.add({x: 1, y: 4}, mouse), true, 'should insert');
assert.equal(gc.add({x: 1, y: 5}, mouse), false, 'no insert, already have entry');

assert.equal(gc.has({x: 1, y: 2}), true);
assert.equal(gc.has({x: 1, y: 3}), true);
assert.equal(gc.has({x: 1, y: 4}), true);
assert.equal(gc.has({x: 1, y: 5}), false);
assert.equal(gc.has({x: 1, y: 6}), false);

assert.strictEqual(gc.get({x: 1, y: 2}), dog, 'should get an entry');

assert.equal(gc.get({x: 1, y: 10}), null, 'null if cannot get');

let found = [];
for (let entry of gc.each()) {
  found.push(entry);
}

let expect = [
  { name: 'Snoopy', x: 1, y: 2 },
  { name: 'Felix', x: 1, y: 3 },
  { name: 'Mickey', x: 1, y: 4 }
];

assert.deepEqual(found, expect, 'should have three entries');
assert.equal(gc.size(), 3, 'has three items');

assert.equal(gc.moveAtCoordinate({x: 1, y: 2}, {x: 3, y: 2}), true, 'moves item');

assert.equal(gc.has({x: 1, y: 2}), false, 'no longer has entry at coordinate');
assert.equal(gc.has({x: 3, y: 2}), true, 'now has entry at new coordinate');

assert.equal(gc.moveAtCoordinate({x: 10, y: 20}, {x: 30, y: 20}), false, 'nothing to move at coord');
assert.equal(gc.moveAtCoordinate({x: 1, y: 3}, {x: 1, y: 4}), false, 'something at destination');

assert.equal(gc.size(), 3, 'still has three items');

assert.equal(gc.destroyAtCoordinate({x: 1, y: 4}), true, 'destroys entry at coord');
assert.equal(gc.destroyAtCoordinate({x: 1, y: 4}), false, 'nothing to destroy');

assert.equal(gc.size(), 2, 'now has two items');

assert.equal(gc.destroy(mouse), false, 'cannot destroy removed entry');
assert.equal(gc.destroy(dog), true, 'does destroy real entry');
assert.equal(gc.destroy(dog), false, 'cannot destroy removed entry');

assert.equal(gc.size(), 1, 'now has one item');

assert.equal(gc.clear(), 1, 'clears the remaining one item');
assert.equal(gc.size(), 0, 'now has no items');
assert.equal(gc.clear(), 0, 'nothing to clear out');

console.log('TESTS PASS');
