const random = require('../../utility/random');
const MIN_SIZE = 5;
const MAX_SIZE = 11;

const EDGE = {
  WALL: 'wall',
  HOLE: 'hole',
  NONE: 'none'
};

const DEFAULTS = {
  size: 7,
  treasure: false,
  litter: false,
  pillars: true,
  //holes: true,
  //edge: EDGE.WALL,
  //traps: true,
  //enemies: true,
  //water: false
};

const LAYERS = [
  'floor',
  'mid',
  'ceiling'
];

const ROOM_TYPES = {
  // All
  A1: ['n', 'e', 's', 'w'],

  // Bend
  B1: ['n', 'e'],
  B2: ['e', 's'],
  B3: ['s', 'w'],
  B4: ['w', 'n'],

  // Corridor
  C1: ['n', 's'],
  C2: ['e', 'w'],

  // Deadend
  D1: ['n'],
  D2: ['e'],
  D3: ['s'],
  D4: ['w'],

  // E Shaped?
  E1: ['n', 'e', 'w'],
  E2: ['n', 'e', 's'],
  E3: ['e', 's', 'w'],
  E4: ['n', 's', 'w'],

  // Fucked
  F1: []
};

const FLOOR = {
  SOLID: 'solid',
  LITTER: 'litter'
};

const MID = {
  WALL: 'wall',
  DOOR: 'door',
  PILLAR: 'pillar',
  TREASURE: 'treasure'
};

const CEILING = {
};

const BLOCK = {
  BLOCK: true,
  SPECIAL: 'special', // Can be walked to / activated but not walked through
  FREE: false
};

class Generator {
  constructor(defaults = {}) {
    defaults.size = Math.floor(defaults.size);

    if (defaults.size % 2 === 0) {
      defaults.size--;
    }

    if (defaults.size < MIN_SIZE) {
      defaults.size = MIN_SIZE;
    } else if (defaults.size > MAX_SIZE) {
      defaults.size = MAX_SIZE;
    }

    this.defaults = defaults;
    this.doors = [];
    this.layers = {};
  }

  generate(options) {
    let opts = Object.assign({}, DEFAULTS, this.defaults, options);

    this.size = opts.size;
    this.type = opts.type;

    this.center = {
      x: Math.floor(this.size / 2),
      y: Math.floor(this.size / 2)
    };

    this.layers = this.emptyLayers();
    this.doors = this.buildDoors();
    this.basic = this.basicLayout();
    this.basicProtection();

    if (opts.treasure) this.addTreasure();
    if (opts.pillars) this.addPillars();

    if (opts.litter) this.addLitter(); // Do last

    return {
      size: {
        width: this.size,
        height: this.size
      },
      center: this.center,
      type: this.type,
      doors: this.doors,
      layers: this.layers
    };
  }

  basicLayout() {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        // Floors
        this.layers.floor[y][x] = FLOOR.SOLID;

        // Doors
        let door = this.getDoor(x, y);
        this.layers.composite[y][x] = Generator.roomTemplate({x, y, door});
        if (door) {
          this.layers.mid[y][x] = MID.DOOR;
          this.layers.composite[y][x].block = BLOCK.SPECIAL;
        }

        // Walls
        if (!door && (x === 0 || y === 0 || x === this.size - 1 || y === this.size - 1)) {
          this.layers.composite[y][x].wall = true;
          this.layers.composite[y][x].block = true;
          this.layers.mid[y][x] = MID.WALL;
        }
      }
    }
  }

  getDoor(x,y) {
    for (let d of this.doors) {
      if (d.x === x && d.y === y) {
        return d.direction;
      }
    }
    return null;
  }

  emptyLayers() {
    // Contains a simple 2D representation of the level
    let composite = [];

    // Three separate layers representing the level
    let floor = [];
    let mid = [];
    let ceiling = [];

    for (let y = 0; y < this.size; y++) {
      composite[y] = [];
      floor[y] = [];
      mid[y] = [];
      ceiling[y] = [];
      for (let x = 0; x < this.size; x++) {
        composite[y][x] = null;
        floor[y][x] = null;
        mid[y][x] = null;
        ceiling[y][x] = null;
      }
    }

    return {
      composite,
      floor,
      mid,
      ceiling
    };
  }

  buildDoors() {
    let roomType = ROOM_TYPES[this.type];
    let doors = [];

    for (let direction of roomType) {
      let door = {
        direction,
        orientation: direction === 'n' || direction === 's' ? 'v' : 'h',
        x: null,
        y: null
      };
      if (direction === 'n') {
        door.x = this.center.x;
        door.y = 0;
      } else if (direction === 'e') {
        door.x = this.size - 1;
        door.y = this.center.y;
      } else if (direction === 's') {
        door.x = this.center.x;
        door.y = this.size - 1;
      } else if (direction === 'w') {
        door.x = 0;
        door.y = this.center.y;
      }

      doors.push(door);
    }

    return doors;
  }

  // Stick treasure in center of room
  // Make adjacent squares protected
  addTreasure() {
    let c = this.center;
    for (let y = c.y - 1; y <= c.y + 1; y++) {
      for (let x = c.x - 1; x <= c.x + 1; x++) {
        this.setProtect(x, y);
      }
    }

    this.layers.composite[c.y][c.x].treasure = true;
    this.layers.composite[c.y][c.x].block = BLOCK.SPECIAL;
    this.layers.mid[c.y][c.x] = MID.TREASURE;
  }

  addPillars() {
    if (this.size <= 5) return;

    for (let y = 2; y < this.size - 2; y += 2) {
      for (let x = 2; x < this.size - 2; x += 2) {
        if (this.isProtected(x, y)) continue;
        this.layers.mid[y][x] = MID.PILLAR;
        this.layers.composite[y][x].pillar = true;
        this.layers.composite[y][x].block = BLOCK.BLOCK;
      }
    }
  }

  // Litter is passable, simple visual clutter
  addLitter() {
    let litter = this.size - 2; // Amonut of litter is square root of area (minus outer walls)
    let limit = this.size * 3; // how many passes before we give up
    while (litter > 0 && limit > 0) {
      let x = random.range(0, this.size);
      let y = random.range(0, this.size);
      if (!this.isBlocked(x, y)) {
        litter--;
        this.layers.floor[y][x] = FLOOR.LITTER;
        this.layers.composite[y][x].litter = true;
      }
      limit--;
    }
  }

  basicProtection() {
    let c = this.center;
    let iter;
    for (let d of this.doors) {
      if (d.x === c.x) {
        iter = d.y < c.y ? 1 : -1;
        for (let y = d.y; y != c.y; y += iter) this.setProtect(d.x, y);
      } else if (d.y === c.y) {
        iter = d.x < c.x ? 1 : -1;
        for (let x = d.x; x != c.x; x += iter) this.setProtect(x, d.y);
      }
    }

    this.setProtect(c.x, c.y);
  }

  setProtect(x, y, protect = true) {
    this.layers.composite[y][x].protected = protect;
  }

  isProtected(x, y) {
    return this.layers.composite[y][x].protected;
  }

  isBlocked(x, y) {
    return !!this.layers.composite[y][x].block;
  }

  static roomTemplate({x, y, door}) {
    return {
      x,
      y,
      door,
      wall: false,
      block: BLOCK.FREE, // Player cannot pass
      protected: !!door // Prevent level generator from building on this tile
    };
  }
}

module.exports = Generator;
