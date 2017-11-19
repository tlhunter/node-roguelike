const MazeKeyGen = require('../index.js');

const level = new MazeKeyGen({rooms: 100, keys: 5});

const result = level.generate();

console.log(JSON.stringify(result, null, 2));

console.log(level);
