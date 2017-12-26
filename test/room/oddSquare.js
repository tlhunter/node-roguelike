#!/usr/bin/env node

const colors = require('colors/safe');

const Gen = require('../../room/oddSquare/index.js');

//makeRoom('A1', 17, true, 0.25, false);
//makeRoom('E3', 7, false, 0.5, false, true, 1, true);
//makeRoom('C1', 11, true, 0.1, false);
//makeRoom('F1', 5, false, 0, false);
//makeRoom('E4', 13, true, 0.2, true, false, 0, true);
makeRoom('D1', 11, true, 0.3, true, true, 3, true);
//makeRoom('C2', 21, true, 0.1, true, true, 3);

function makeRoom(type, size, treasure, litter, chasm, circle, gashes, decor) {
  const start = Date.now();
  const gen = new Gen({
    size
  });

  const room = gen.generate({
    type,
    treasure,
    litter,
    chasm,
    circle,
    gashes,
    decor: decor ? [
      {id: 'cobweb', rate: 0.1, location: 'any'},
      {id: 'desk', count: 1, location: 'central'},
      {id: 'books', rate: 0.05, location: 'edge'}
    ] : undefined,
    holes: false
  });

  const end = Date.now() - start;

  for (let y = 0; y < room.size.height; y++) {
    let row = '';
    for (let x = 0; x < room.size.width; x++) {
      let mid = room.layers.mid[y][x];
      let floor = room.layers.floor[y][x];
      let composite = room.layers.composite[y][x];
      let char;
      if (mid === 'wall') {
        char = '#';
      } else if (mid === 'door') {
        char = '/';
      } else if (mid === 'cobweb') {
        char = '1';
      } else if (mid === 'desk') {
        char = '2';
      } else if (mid === 'books') {
        char = '3';
      } else if (mid === 'treasure') {
        char = '$';
      } else {
        if (floor === 'litter') {
          char = ',';
        } else if (floor === 'chasm') {
          char = ' ';
        } else if (floor === 'bridge') {
          if (composite.bridge === 'h') {
            char = '-';
          } else if (composite.bridge === 'v') {
            char = '|';
          }
        } else {
          char = '.';
        }
      }

      if (composite.protected) {
        char = colors.inverse(char);
      }

      if (composite.block === 'special' ) {
          char = colors.cyan(char);
      } else if (composite.block === true) {
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
  // console.log(room.freespace);
}
