const colors = require('colors/safe');
const MazeKeyGen = require('../index.js');

const NULL_KEY = 'white';
const ENTER_EXIT = 'inverse';
const KEY_COLORS = {
  0: 'red',
  1: 'green',
  2: 'blue',
  3: 'yellow',
  4: 'magenta',
  5: 'cyan'
};

const start = Date.now();
const level = new MazeKeyGen({rooms: 100, keys: 6});
const result = level.generate();
const time = Date.now() - start;

//console.log(JSON.stringify(result.grid, null, 2));
//console.log(level.roomsByDistance, level.maxDistance);

const grid = result.grid;

for (let y = 0; y < result.size.height; y++) {
  let row1 = ''; // room numbers and hyphens
  let row2 = ''; // pipes
  for (let x = 0; x < result.size.width; x++) {
    let roomId = grid[y][x];
    let room = result.rooms[roomId];
    if (!room) {
      row1 += '   ';
      row2 += '   ';
      continue;
    }

    let color = KEY_COLORS[room.keysInRoom[0]] || NULL_KEY;

    if (room.entrance || room.exit) {
      color = ENTER_EXIT;
    }

    row1 += colors[color](String(roomId).padStart(2, '0'));

    if (room.doors.e !== null) {
      let door = result.doors[room.doors.e];
      let color = KEY_COLORS[door.key] || NULL_KEY;
      row1 += colors[color]('-');
    } else {
      row1 += ' ';
    }

    if (room.doors.s !== null) {
      let door = result.doors[room.doors.s];
      let color = KEY_COLORS[door.key] || NULL_KEY;
      row2 += colors[color](' | ');
    } else {
      row2 += '   ';
    }
  }

  console.log(row1);
  console.log(row2);
}

console.log(`Size: ${result.size.width}x${result.size.height}`);
console.log(`Deadends: ${result.terminals.deadends}`);
console.log(`Rooms: ${result.rooms.length}`);
console.log(`Entrance: ${result.terminals.entrance}, Exit: ${result.terminals.exit}`);
console.log(`Keys/Locks: ${result.keys.length}`);
console.log(`Time to Generate: ${time}ms`);
