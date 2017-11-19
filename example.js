const example = {
  size: {
    width: 7,
    height: 7
  },

  terminals: {
    entrance: 0,
    exit: 2
  },

  rooms: [{
    id: 0,
    x: 3,
    y: 3,
    keysInRoom: [0],
    doors: {
      n: 0,
      e: null,
      s: null,
      w: null
    }
  }, {
    id: 1,
    x: 2,
    y: 3,
    keysInRoom: [],
    doors: {
      n: null,
      e: 1,
      s: 0,
      w: null
    }
  }, {
    id: 2,
    x: 2,
    y: 4,
    keysInRoom: [],
    doors: {
      n: null,
      e: null,
      s: null,
      w: 1
    }
  }],

  doors: [{
    id: 0,
    key: 0,
    orientation: 'v',
    rooms: [
      0,
      1
    ]
  },
  {
    id: 1,
    key: null,
    orientation: 'h',
    rooms: [
      1,
      2
    ]
  }],

  keys: [{
    id: 0,
    location: 0, // Room where key is located
    door: 0
  }]
};
