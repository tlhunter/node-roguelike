# Maze Generator

## Usage

```javascript
const MazeKeyGen = require('maze-key-gen');
const level = new MazeKeyGen({rooms: 10, keys: 3});
let result = level.generate();
```

## Example Output

```json
{
  "size": {
    "height": 6,
    "width": 3
  },
  "terminals": {
    "deadends": [ 2, 6, 7, 8, 9 ],
    "entrance": 0,
    "exit": 8
  },
  "grid": [
    [ 7, 0, 2 ],
    [ 6, 1, null ],
    [ null, 3, null ],
    [ 9, 4, null ],
    [ null, 5, null ],
    [ null, 8, null ]
  ],
  "keys": [
    {
      "door": 7,
      "id": 0,
      "location": 5
    },
    {
      "door": 4,
      "id": 1,
      "location": 9
    },
    {
      "door": 8,
      "id": 2,
      "location": 4
    }
  ],
  "doors": [
    {
      "exit": false,
      "id": 0,
      "key": null,
      "orientation": "v",
      "rooms": [ 0, 1 ]
    },
    {
      "exit": false,
      "id": 1,
      "key": null,
      "orientation": "h",
      "rooms": [ 0, 2 ]
    },
    {
      "exit": false,
      "id": 2,
      "key": null,
      "orientation": "v",
      "rooms": [ 1, 3 ]
    },
    {
      "exit": false,
      "id": 3,
      "key": null,
      "orientation": "v",
      "rooms": [ 3, 4 ]
    },
    {
      "exit": false,
      "id": 4,
      "key": 1,
      "orientation": "v",
      "rooms": [ 4, 5 ]
    },
    {
      "exit": false,
      "id": 5,
      "key": null,
      "orientation": "h",
      "rooms": [ 1, 6 ]
    },
    {
      "exit": false,
      "id": 6,
      "key": null,
      "orientation": "h",
      "rooms": [ 0, 7 ]
    },
    {
      "exit": true,
      "id": 7,
      "key": 0,
      "orientation": "v",
      "rooms": [ 5, 8 ]
    },
    {
      "exit": false,
      "id": 8,
      "key": 2,
      "orientation": "h",
      "rooms": [ 4, 9 ]
    }
  ],
  "rooms": [
    {
      "distance": 0,
      "doors": { "e": 1, "n": null, "s": 0, "w": 6 },
      "entrance": true,
      "exit": false,
      "id": 0,
      "keyInRoom": null,
      "template": "E3",
      "x": 1,
      "y": 0
    },
    {
      "distance": 1,
      "doors": { "e": null, "n": 0, "s": 2, "w": 5 },
      "entrance": false,
      "exit": false,
      "id": 1,
      "keyInRoom": null,
      "template": "E4",
      "x": 1,
      "y": 1
    },
    {
      "distance": 1,
      "doors": { "e": null, "n": null, "s": null, "w": 1 },
      "entrance": false,
      "exit": false,
      "id": 2,
      "keyInRoom": null,
      "template": "D4",
      "x": 2,
      "y": 0
    },
    {
      "distance": 2,
      "doors": { "e": null, "n": 2, "s": 3, "w": null },
      "entrance": false,
      "exit": false,
      "id": 3,
      "keyInRoom": null,
      "template": "C1",
      "x": 1,
      "y": 2
    },
    {
      "distance": 3,
      "doors": { "e": null, "n": 3, "s": 4, "w": 8 },
      "entrance": false,
      "exit": false,
      "id": 4,
      "keyInRoom": 2,
      "template": "E4",
      "x": 1,
      "y": 3
    },
    {
      "distance": 4,
      "doors": { "e": null, "n": 4, "s": 7, "w": null },
      "entrance": false,
      "exit": false,
      "id": 5,
      "keyInRoom": 0,
      "template": "C1",
      "x": 1,
      "y": 4
    },
    {
      "distance": 2,
      "doors": { "e": 5, "n": null, "s": null, "w": null },
      "entrance": false,
      "exit": false,
      "id": 6,
      "keyInRoom": null,
      "template": "D2",
      "x": 0,
      "y": 1
    },
    {
      "distance": 1,
      "doors": { "e": 6, "n": null, "s": null, "w": null },
      "entrance": false,
      "exit": false,
      "id": 7,
      "keyInRoom": null,
      "template": "D2",
      "x": 0,
      "y": 0
    },
    {
      "distance": 5,
      "doors": { "e": null, "n": 7, "s": null, "w": null },
      "entrance": false,
      "exit": true,
      "id": 8,
      "keyInRoom": null,
      "template": "D1",
      "x": 1,
      "y": 5
    },
    {
      "distance": 4,
      "doors": { "e": 8, "n": null, "s": null, "w": null },
      "entrance": false,
      "exit": false,
      "id": 9,
      "keyInRoom": 1,
      "template": "D2",
      "x": 0,
      "y": 3
    }
  ]
}
```
