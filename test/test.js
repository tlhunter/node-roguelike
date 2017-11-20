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

const ROOMS = Number(process.argv[2]) || 100;
const KEYS = Number(process.argv[3]) || 6;

const start = Date.now();
const level = new MazeKeyGen({rooms: ROOMS, keys: KEYS});
const result = level.generate();
const time = Date.now() - start;

const grid = result.grid;

for (let y = 0; y < result.size.height; y++) {
  let row1 = ''; // room numbers and hyphens
  let row2 = ''; // pipes
  for (let x = 0; x < result.size.width; x++) {
    let roomId = grid[y][x];
    let room = result.rooms[roomId];
    if (!room) {
      row1 += '    ';
      row2 += '    ';
      continue;
    }

    let color = KEY_COLORS[room.keyInRoom] || NULL_KEY;

    if (room.entrance || room.exit) {
      color = ENTER_EXIT;
    }

    row1 += colors[color](String(roomId).padStart(3, '0'));

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
      row2 += colors[color]('  | ');
    } else {
      row2 += '    ';
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

console.log(JSON.stringify(result));
