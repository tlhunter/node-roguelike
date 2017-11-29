#!/usr/bin/env node

const Gen = require('../../room/oddSquare/index.js');

makeRoom('A1', 17, true, true, true);
makeRoom('E3', 7, false, false, true);
makeRoom('C1', 11, false, true, true);
makeRoom('F1', 5, false, false, false);
//makeRoom('E2', 5, true, true, true);

function makeRoom(type, size, pillars, treasure, litter) {
  const start = Date.now();
  const gen = new Gen({
    size
  });

  const room = gen.generate({
    type,
    pillars,
    treasure,
    litter
  });

  const end = Date.now() - start;

  for (let y = 0; y < room.size.height; y++) {
    let row = '';
    for (let x = 0; x < room.size.width; x++) {
      let mid = room.layers.mid[y][x];
      let floor = room.layers.floor[y][x];
      if (mid === 'wall') {
        row += '#';
      } else if (mid === 'door') {
        row += '/';
      } else if (mid === 'pillar') {
        row += 'I';
      } else if (mid === 'treasure') {
        row += '$';
      } else {
        if (floor === 'litter') {
          row += ',';
        } else {
          row += '.';
        }
      }
    }
    console.log(row);
  }

  //console.log(JSON.stringify(room, null, 2));
  console.log(`Took ${end}ms to generate room`);
  console.log(`Room Type: ${type}, Size: ${size}`);
  console.log();
}
