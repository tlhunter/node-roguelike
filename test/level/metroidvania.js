#!/usr/bin/env node

const LevelMetroidvania = require('../../level/metroidvania');

const result = LevelMetroidvania({
  width: 9,
  height: 9,
  minZonesPerRoom: 1,
  maxZonesPerRoom: 5,
  minRoomsPerMap: 5,
  maxRoomsPerMap: 15,
  newDoors: 2,
  roomDiff: 3,
  roomDiffOdds: 1/4
});

console.log(JSON.stringify(result, null, 2));
