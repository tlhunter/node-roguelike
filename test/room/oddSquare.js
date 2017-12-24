#!/usr/bin/env node

const colors = require('colors/safe');

const Gen = require('../../room/oddSquare/index.js');

makeRoom('A1', 17, true, true, true, false);
makeRoom('E3', 7, false, false, true, false);
makeRoom('C1', 11, false, true, true, false);
makeRoom('F1', 5, false, false, false, false);
makeRoom('E4', 13, false, true, true, true);
makeRoom('E4', 11, false, true, true, true, true, 2);
//makeRoom('E2', 5, true, true, true, false);

function makeRoom(type, size, pillars, treasure, litter, chasm, circle, gashes) {
  const start = Date.now();
  const gen = new Gen({
    size
  });

  const room = gen.generate({
    type,
    pillars,
    treasure,
    litter,
    chasm,
    circle,
    gashes,
    holes: chasm
  });

  const end = Date.now() - start;

  for (let y = 0; y < room.size.height; y++) {
    let row = '';
    for (let x = 0; x < room.size.width; x++) {
      let mid = room.layers.mid[y][x];
      let floor = room.layers.floor[y][x];
      let char;
      if (mid === 'wall') {
        char = '#';
      } else if (mid === 'door') {
        char = '/';
      } else if (mid === 'pillar') {
        char = 'I';
      } else if (mid === 'treasure') {
        char = '$';
      } else {
        if (floor === 'litter') {
          char = ',';
        } else if (floor === 'chasm') {
          char = ' ';
        } else {
          char = '.';
        }
      }

      let c = room.layers.composite[y][x];
      if (c.protected) {
        char = colors.inverse(char);
      }

      if (c.block === 'special' ) {
          char = colors.cyan(char);
      } else if (c.block === true) {
        char = colors.red(char);
      }

      row += char;
    }
    console.log(row);
  }

  //console.log(JSON.stringify(room, null, 2));
  console.log(`Took ${end}ms to generate room`);
  console.log(`Room Type: ${type}, Size: ${size}`);
  console.log();
}
