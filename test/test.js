const MazeKeyGen = require('../index.js');

const level = new MazeKeyGen({rooms: 99, keys: 5});

const result = level.generate();

//console.log(JSON.stringify(result.grid, null, 2));

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
    row1 += String(roomId).padStart(2);
    if (room.doors.e !== null) {
      row1 += '-';
    } else {
      row1 += ' ';
    }

    if (room.doors.s !== null) {
      row2 += ' | ';
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

//console.log(level);
