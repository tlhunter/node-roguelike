const MazeKeyGen = require('../index.js');

const level = new MazeKeyGen({rooms: 5, keys: 2});

const result = level.generate();

console.log(JSON.stringify(result, null, 2));
