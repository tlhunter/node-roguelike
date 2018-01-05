#!/usr/bin/env node

const assert = require('assert');
const random = require('../../utility/random/index.js');

assert.equal(random.dice('100'), 100);
assert.equal(random.dice('100', false), 100);
assert.equal(random.dice('+100'), 100);
assert.equal(random.dice('+100', false), 100);
assert.equal(random.dice('-100', true), -100);
assert.equal(random.dice('-100'), 0);
assert.equal(random.dice('1d0'), 0);
assert.equal(random.dice('1d1'), 1);
assert.equal(random.dice('d1'), 1);
assert.equal(random.dice('d1 + 0'), 1);
assert.equal(random.dice('d1+ 0'), 1);
assert.equal(random.dice('d1 +0'), 1);
assert.equal(random.dice('d1+0'), 1);
assert.equal(random.dice('d1 + 1'), 2);
assert.equal(random.dice('d1+ 1'), 2);
assert.equal(random.dice('d1 +1'), 2);
assert.equal(random.dice('d1+1'), 2);
assert.equal(random.dice('d1 - 3'), 0);
assert.equal(random.dice('d1- 3'), 0);
assert.equal(random.dice('d1 -3'), 0);
assert.equal(random.dice('d1-3'), 0);
assert.equal(random.dice('d1 - 3', true), -2);
assert.equal(random.dice('d1- 3', true), -2);
assert.equal(random.dice('d1 -3', true), -2);
assert.equal(random.dice('d1-3', true), -2);



let sixHitOne = false;
let sixHitSix = false;
for (let i = 0; i < 1000; i++) {
  let dice = random.dice('1d6');
  assert.ok(dice >= 1);
  assert.ok(dice <= 6);
  if (dice === 1) sixHitOne = true;
  if (dice === 6) sixHitSix = true;
}
assert.ok(sixHitOne);
assert.ok(sixHitSix);



let sixesHitTwo = false;
let sixesHitTwelve = false;
for (let i = 0; i < 1000; i++) {
  let dice = random.dice('2d6');
  assert.ok(dice >= 2);
  assert.ok(dice <= 12);
  if (dice === 2) sixesHitTwo = true;
  if (dice === 12) sixesHitTwelve = true;
}
assert.ok(sixesHitTwo);
assert.ok(sixesHitTwelve);



let eightsHitZero = false;
let eightsHitFourteen = false;
for (let i = 0; i < 1000; i++) {
  let dice = random.dice('2d8 - 2');
  assert.ok(dice >= 0);
  assert.ok(dice <= 14);
  if (dice === 0) eightsHitZero = true;
  if (dice === 14) eightsHitFourteen = true;
}
assert.ok(eightsHitZero);
assert.ok(eightsHitFourteen);



let ninesHitZero = false;
let ninesHitNine = false;
for (let i = 0; i < 1000; i++) {
  let dice = random.dice('2d9 - 9');
  assert.ok(dice >= 0);
  assert.ok(dice <= 9);
  if (dice === 0) ninesHitZero = true;
  if (dice === 9) ninesHitNine = true;
}
assert.ok(ninesHitZero);
assert.ok(ninesHitNine);


console.log('PASS');
