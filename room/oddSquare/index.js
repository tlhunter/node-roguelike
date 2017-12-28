const random = require('../../utility/random');
const grid = require('../../utility/grid');
const GridCollection = require('../../utility/gridCollection');

const MIN_SIZE = 5;
const MAX_SIZE = 17;

const EDGE = {
  WALL: 'wall',
  HOLE: 'hole',
  NONE: 'none'
};

const DEFAULTS = {
  size: 7,
  treasure: false,
  litter: 0.0,
  chasm: false,
  holes: false,
  circle: false,
  decor: false, // TODO: Support destructable decor which can be placed on non-doorstop-protected tiles
  gashes: 0
};

const DECOR_LOC = {
  ANY: 'any',
  CENTRAL: 'central',
  EDGE: 'edge'
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

  // E Shaped? More like a T...
  E1: ['n', 'e', 'w'],
  E2: ['n', 'e', 's'],
  E3: ['e', 's', 'w'],
  E4: ['n', 's', 'w'],

  // Fucked? Gotta be a better name...
  F1: []
};

const FLOOR = {
  CHASM: 'chasm',
  BRIDGE: 'bridge',
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
  DECOR: 'decor',
  SPECIAL: 'special', // Can be walked to / activated but not walked through
  FALL: 'fall', // Entity would fall, up to game if this should block
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
    this.chasm = !!opts.chasm;
    this.circle = !!opts.circle;
    this.gashes = Number(opts.gashes);
    this.litter = opts.litter;
    this.decor = opts.decor && opts.decor.length ? opts.decor : [];

    this.center = {
      x: Math.floor(this.size / 2),
      y: Math.floor(this.size / 2)
    };

    this.focalpoint = opts.focalpoint ? opts.focalpoint : {
      x: random.range(2, this.size - 3),
      y: random.range(2, this.size - 3)
    };

    this.freeSpace = new GridCollection();

    this.layers = this.emptyLayers();
    this.doors = this.buildDoors();
    this.basic = this.basicLayout();
    this.basicProtection();

    if (opts.treasure) this.addTreasure();

    if (opts.gashes) this.addGashes();
    if (opts.holes) this.addHoles();

    const freeSpace = this.prepareFreeSpace();

    if (opts.decor) this.addDecor(freeSpace);
    if (opts.litter) this.addLitter(freeSpace); // Do last

    return {
      size: {
        width: this.size,
        height: this.size
      },
      center: this.center,
      focalpoint: this.focalpoint,
      freespace: Array.from(this.freeSpace.each()),
      type: this.type,
      chasm: this.chasm,
      doors: this.doors,
      layers: this.layers
    };
  }

  basicLayout() {
    const radius = Math.ceil(this.size / 2) - 1.5;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        // Doors
        let door = this.getDoor(x, y);
        this.layers.composite[y][x] = Generator.roomTemplate({x, y, door});

        // Floors
        if (this.chasm && this.circle) {
          if (grid.distance({x, y}, this.center) <= radius) {
            // TODO: This could easily be made faster, e.g. calculate each quadrant
            this.layers.floor[y][x] = FLOOR.SOLID;
          } else {
            this.layers.floor[y][x] = FLOOR.CHASM;
            this.layers.composite[y][x].block = BLOCK.FALL;
          }
        } else if (this.chasm && (y === 0 || x === 0 || y === this.size-1 || x === this.size-1)) {
          this.layers.floor[y][x] = FLOOR.CHASM;
          this.layers.composite[y][x].block = BLOCK.FALL;
          this.layers.composite[y][x].bridge = true;
        } else {
          this.layers.floor[y][x] = FLOOR.SOLID;
        }

        if (door) {
          this.layers.mid[y][x] = MID.DOOR;
          this.layers.composite[y][x].block = BLOCK.SPECIAL;
          if (this.chasm) this.layers.floor[y][x] = FLOOR.BRIDGE;
        }

        if (this.layers.floor[y][x] === FLOOR.SOLID) {
          this.freeSpace.add({x,y}, {});
        }

        // Walls
        if (!this.chasm && !door && (x === 0 || y === 0 || x === this.size - 1 || y === this.size - 1)) {
          this.layers.composite[y][x].wall = true;
          this.layers.composite[y][x].block = true;
          this.layers.mid[y][x] = MID.WALL;
          this.freeSpace.destroyAtCoordinate({x, y});
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
    let c = this.focalpoint;

    for (let y = c.y - 1; y <= c.y + 1; y++) {
      for (let x = c.x - 1; x <= c.x + 1; x++) {
        this.setProtect(x, y);
      }
    }

    this.layers.composite[c.y][c.x].treasure = true;
    this.layers.composite[c.y][c.x].block = BLOCK.SPECIAL;
    this.layers.mid[c.y][c.x] = MID.TREASURE;
  }

  prepareFreeSpace() {
    let freeSpace = random.shuffle(Array.from(this.freeSpace.each()));

    // Tag each spot as being edge (cardinal near void) or not
    const dirs = [
      {x: 0, y: -1},
      {x: 1, y: 0},
      {x: 0, y: 1},
      {x: -1, y: 0}
    ];
    for (let fs of freeSpace) {
      fs.edge = false;
      for (let dir of dirs) {
        const d = {
          x: fs.x + dir.x,
          y: fs.y + dir.y
        };
        if (d.x < 0 || d.y < 0 || d.x >= this.size || d.y >= this.size) {
          continue;
        }
        if (this.layers.floor[d.y][d.x] === FLOOR.CHASM) {
          fs.edge = true;
          break;
        }
      }
    }

    return freeSpace;
  }

  addDecor(freeSpace) {
    let total = freeSpace.length;
    for (let decor of this.decor) {
      let count = decor.count ? decor.count : Math.ceil(decor.rate * total) || 0;
      const loc = decor.location;
      for (let fs of freeSpace) {
        if (fs.flush) continue;
        if (loc === DECOR_LOC.ANY || loc === DECOR_LOC.CENTRAL && !fs.edge || loc === DECOR_LOC.EDGE && fs.edge) {
          this.layers.composite[fs.y][fs.x].decor = decor.id;
          this.layers.composite[fs.y][fs.x].block = BLOCK.DECOR;
          this.layers.mid[fs.y][fs.x] = decor.id;
          this.freeSpace.destroyAtCoordinate({x: fs.x, y: fs.y});
          fs.flush = true;
          count--;
          if (count <= 0) break;
        }
      }
    }
  }

  // Litter is passable, simple visual clutter
  addLitter(freeSpace) {
    let count = Math.ceil(this.litter * freeSpace.length);

    for (let fs of freeSpace) {
      if (fs.flush) continue;
      this.layers.floor[fs.y][fs.x] = FLOOR.LITTER;
      this.layers.composite[fs.y][fs.x].litter = true;
      // No need to remove from this.freeSpace since it's still free
      count--;
      if (count <= 0) break;
    }
  }

  addGashes() {
    let potentials = [];

    for (let i = 0; i < this.size * 2; i++) potentials.push(i);

    potentials = random.shuffle(potentials).slice(0, this.gashes);

    for (let gash of potentials) {
      const anchor = gash <= this.size -1
        ? { mode: 'x', value: gash }
        : { mode: 'y', value: gash - this.size };

      for (let i = 0; i < this.size; i++) {
        const x = anchor.mode === 'x' ? anchor.value : i;
        const y = anchor.mode === 'y' ? anchor.value : i;
        if (anchor.mode === 'x' && y === this.center.y) { // Chasm bridge
          // Prevent some things from blocking path, though adjacent hole can break walkability
          this.setProtect(x, y);
          this.freeSpace.destroyAtCoordinate({x, y});
          continue;
        } else if (anchor.mode === 'y' && x === this.center.x) { // Chasm bridge
          // Prevent some things from blocking path, though adjacent hole can break walkability
          this.setProtect(x, y);
          this.freeSpace.destroyAtCoordinate({x, y});
          continue;
        }
        if (!this.isProtected(x, y) && !this.layers.composite[y][x].wall) {
          this.layers.floor[y][x] = FLOOR.CHASM;
          this.layers.composite[y][x].chasm = true;
          this.layers.composite[y][x].block = BLOCK.FALL;
          this.freeSpace.destroyAtCoordinate({x, y});
        }
      }
    }
  }

  addHoles() {
    let holes = this.size - 2; // Amount of holes is square root of area (minus outer walls)
    let limit = this.size * 3; // how many passes before we give up
    while (holes > 0 && limit > 0) {
      let x = random.range(0, this.size-1);
      let y = random.range(0, this.size-1);
      if (!this.isProtected(x, y) && !this.isBlocked(x, y)) {
        holes--;
        this.layers.floor[y][x] = FLOOR.CHASM;
        this.layers.composite[y][x].chasm = true;
        this.layers.composite[y][x].block = BLOCK.FALL;
        this.freeSpace.destroyAtCoordinate({x, y});
      }
      limit--;
    }
  }

  basicProtection() {
    for (let d of this.doors) {
      this.setProtect(d.x, d.y);

      let doorstop = {x: null, y: null};

      if (d.direction === 'n') {
        doorstop.x = d.x;
        doorstop.y = d.y + 1;
      } else if (d.direction === 'e') {
        doorstop.x = d.x - 1;
        doorstop.y = d.y;
      } else if (d.direction === 's') {
        doorstop.x = d.x;
        doorstop.y = d.y - 1;
      } else if (d.direction === 'w') {
        doorstop.x = d.x + 1;
        doorstop.y = d.y;
      }

      let line = grid.line(this.focalpoint, doorstop, true);

      for (let p of line) {
        this.setProtect(p.x, p.y);
      }
    }
  }

  setProtect(x, y, protect = true) {
    if (protect) this.freeSpace.destroyAtCoordinate({x, y});
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
