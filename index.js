const MAX_X = 201;
const MAX_Y = 201;
const DIR = ['n', 'e', 's', 'w'];

class MazeKeyGen {
  constructor({rooms, keys}) {
    this.maxRooms = rooms;
    this.maxKeys = keys;

    this.reset();
  }

  reset() {
    this.rooms = [];
    this.doors = [];
    this.keys = [];

    // Room IDs
    this.entrance = 0;
    this.exit = null;

    this.seed = {
      x: Math.floor(MAX_X / 2),
      y: Math.floor(MAX_Y / 2)
    };

    // Keeps track of the edges of the map
    // Useful to shrink map when done
    this.bounds = {
      n: this.seed.y,
      e: this.seed.x,
      s: this.seed.y,
      w: this.seed.x
    };

    // Keeps track of the room which is the furthest in any direction
    // Rooms are tracked based on their coordinate tangential to that direction
    // This lets us add rooms without iteratively 'sliding' them in from the outside
    this.furthest = {
      n: new Map(), // X => roomId
      e: new Map(), // Y => roomId
      s: new Map(), // X => roomId
      w: new Map()  // Y => roomId
    };
  }

  generate() {
    this.reset();

    const root = this.addRoom(this.seed.x, this.seed.y);
    console.log('furthest obj after adding root', this.furthest);

    for (let i = 0; i < this.maxRooms; i++) {
      let dir = DIR[Math.floor(Math.random() * DIR.length)]; // Which direction are we adding a room from

      let x, y, parentRoom;

      console.log('DIRECTION', dir, 'BOUNDS', this.bounds);
      if (dir === 'n') { // Sliding southward from north
        x = Math.floor(Math.random() * (this.bounds.e - this.bounds.w)) + this.bounds.w;
        console.log('X', x);
        const parentRoomId = this.furthest.n.get(x);
        parentRoom = this.rooms[parentRoomId];
        y = parentRoom.y - 1;
        console.log('Y', y);
      } else if (dir === 'e') { // Sliding westward from east
        y = Math.floor(Math.random() * (this.bounds.s - this.bounds.n)) + this.bounds.n;
        console.log('Y', y);
        const parentRoomId = this.furthest.e.get(y);
        parentRoom = this.rooms[parentRoomId];
        x = parentRoom.x + 1;
        console.log('X', x);
      } else if (dir === 's') { // Sliding northward from south
        x = Math.floor(Math.random() * (this.bounds.e - this.bounds.w)) + this.bounds.w;
        console.log('X', x);
        const parentRoomId = this.furthest.s.get(x);
        parentRoom = this.rooms[parentRoomId];
        y = parentRoom.y + 1;
        console.log('Y', y);
      } else if (dir === 'w') { // Sliding eastward from west
        y = Math.floor(Math.random() * (this.bounds.s - this.bounds.n)) + this.bounds.n;
        console.log('Y', y);
        const parentRoomId = this.furthest.w.get(y);
        parentRoom = this.rooms[parentRoomId];
        x = parentRoom.x - 1;
        console.log('X', x);
      }

      const newRoomId = this.addRoom(x, y);
      console.log('new room', newRoomId);
      const d = this.addDoor(parentRoom.id, newRoomId);
    }

    //this.setExit(longestRoom);


    const {width, height} = this.squish();

    const deadends = this.classifyRooms();

    return {
      size: {
        width,
        height
      },
      terminals: {
        entrance: this.entrance,
        exit: this.exit,
        deadends
      },
      rooms: this.rooms,
      //rooms: this.rooms.map(r => {
        //// Children is an internal concept
        //delete r.children;
        //return r;
      //}),
      doors: this.doors,
      keys: this.keys
    };
  }

  /**
   * Shrink the boundaries of the map
   * Set a new X/Y for every room
   * @return smallest {width,height} required to fit map
   */
  squish() {
    const width = this.bounds.e - this.bounds.w + 1;
    const height = this.bounds.s - this.bounds.n + 1;

    const xShift = this.bounds.w;
    const yShift = this.bounds.n;

    for (const room of this.rooms) {
      room.x -= xShift;
      room.y -= yShift;
    }

    return {width, height};
  }

  addRoom(x, y) {
    for (let room of this.rooms) { // TODO: DON'T COMMIT
      if (room.x === x && room.y === y) {
        console.error('furthest', this.furthest);
        console.error('new x, y', x, y);
        console.error(room);
        throw new Error("ROOM COLLISION!");
      }
    }
    const roomId = this.rooms.length;

    this.stretch(x, y);
    this.further(x, y, roomId);

    const room = {
      id: roomId,
      x,
      y,
      children: new Set(),
      keysInRoom: [],
      template: 'F1',
      distance: roomId === 0 ? 0 : null, // Distance from room[0] / spawn
      exit: false,
      entrance: roomId === 0,
      doors: {
        n: null,
        e: null,
        s: null,
        w: null
      }
    };

    this.rooms.push(room);

    return roomId;
  }

  further(x, y, roomId) {
    const mostNorth = this.furthest.n.get(x);
    if (typeof mostNorth === 'undefined' || this.rooms[mostNorth].y > y) {
      this.furthest.n.set(x, roomId);
    }

    const mostEast = this.furthest.e.get(y);
    if (typeof mostEast === 'undefined' || this.rooms[mostEast].x < x) {
      this.furthest.e.set(y, roomId);
    }

    const mostSouth = this.furthest.s.get(x);
    if (typeof mostSouth === 'undefined' || this.rooms[mostSouth].y < y) {
      this.furthest.s.set(x, roomId);
    }

    const mostWest = this.furthest.w.get(y);
    if (typeof mostWest === 'undefined' || this.rooms[mostWest].x > x) {
      this.furthest.w.set(y, roomId);
    }
  }

  stretch(x, y) {
    if (y < this.bounds.n) {
      this.bounds.n = y;
    }
    if (x > this.bounds.e) {
      this.bounds.e = x;
    }
    if (y > this.bounds.s) {
      this.bounds.s = y;
    }
    if (x < this.bounds.w) {
      this.bounds.w = x;
    }
  }

  classifyRooms() {
    const deadends = [];

    for (const room of this.rooms) {
      let doors = 0;
      if (room.doors.n !== null) doors++;
      if (room.doors.e !== null) doors++;
      if (room.doors.s !== null) doors++;
      if (room.doors.w !== null) doors++;

      if (doors === 1) { // D (Dead End)
        deadends.push(room.id);
        if (room.doors.n !== null) {
          room.template = 'D1';
        } else if (room.doors.e !== null) {
          room.template = 'D2';
        } else if (room.doors.s !== null) {
          room.template = 'D3';
        } else if (room.doors.w !== null) {
          room.template = 'D4';
        }
      } else if (doors === 2) { // B (Bend) or C (Corridoor)
        if (room.doors.n !== null && room.doors.s !== null) {
          room.template = 'C1';
        } else if (room.doors.e !== null && room.doors.w !== null) {
          room.template = 'C2';
        } else if (room.doors.n !== null && room.doors.e !== null) {
          room.template = 'B1';
        } else if (room.doors.e !== null && room.doors.s !== null) {
          room.template = 'B2';
        } else if (room.doors.s !== null && room.doors.w !== null) {
          room.template = 'B3';
        } else if (room.doors.w !== null && room.doors.n !== null) {
          room.template = 'B4';
        }
      } else if (doors === 3) { // E
        if (room.doors.s === null) {
          room.template = 'E1';
        } else if (room.doors.w === null) {
          room.template = 'E2';
        } else if (room.doors.n === null) {
          room.template = 'E3';
        } else if (room.doors.e === null) {
          room.template = 'E4';
        }
      } else if (doors === 4) { // A (All)
        room.template = 'A1';
      } else { // F (Fucked)
        room.template = 'F1';
      }
    }

    return deadends;
  }

  /**
   * @param rooms Array of two door IDs
   *
   * @return doorId
   */
  addDoor(parentRoomId, childRoomId) {
    const parentRoom = this.rooms[parentRoomId];
    const childRoom = this.rooms[childRoomId];
    const doorId = this.doors.length;
    let orientation = null;

    console.log('addDoor', parentRoomId, childRoomId);
    console.log('parent', parentRoom.x, parentRoom.y);
    console.log('child', childRoom.x, childRoom.y);

    if (parentRoom.x === childRoom.x && parentRoom.y === childRoom.y - 1) {
      // R1 north of R2
      orientation = 'v';
      parentRoom.doors.s = doorId;
      childRoom.doors.n = doorId;
    } else if (parentRoom.x === childRoom.x + 1 && parentRoom.y === childRoom.y) {
      // R1 east of R2
      orientation = 'h';
      parentRoom.doors.w = doorId;
      childRoom.doors.e = doorId;
    } else if (parentRoom.x === childRoom.x && parentRoom.y === childRoom.y + 1) {
      // R1 south of R2
      orientation = 'v';
      parentRoom.doors.n = doorId;
      childRoom.doors.s = doorId;
    } else if (parentRoom.x === childRoom.x - 1 && parentRoom.y === childRoom.y) {
      // R1 west of R2
      orientation = 'h';
      parentRoom.doors.e = doorId;
      childRoom.doors.w = doorId;
    } else {
      throw new Error('Rooms must be adjacent');
    }

    parentRoom.children.add(childRoom);
    childRoom.distance = parentRoom.distance + 1;

    this.doors.push({
      id: doorId,
      key: null,
      orientation,
      exit: false,
      rooms: [parentRoom, childRoom]
    });

    return doorId;
  }

  /**
   * Locks a door, generating a key
   * @return keyId
   */
  lock(doorId, roomId) {
    const door = this.doors[doorId];
    const location = this.rooms[roomId];
    const keyId = this.keys.length;

    if (!door) {
      throw new Error(`Invalid door ${doorId}`);
    }

    if (!location) {
      throw new Error(`Invalid room ${roomId}`);
    }

    this.keys.push({
      id: keyId,
      location: location.id,
      door: doorId
    });

    this.doors[doorId].key = keyId;
    location.keysInRoom.push(keyId);

    return keyId;
  }

  setExit(roomId) {
    const room = this.rooms[roomId];

    if (!room) {
      throw new Error(`invalid room id ${roomId}`);
    }

    room.exit = true;

    if (room.doors.n) this.doors[room.doors.n].exit = true;
    if (room.doors.e) this.doors[room.doors.e].exit = true;
    if (room.doors.s) this.doors[room.doors.s].exit = true;
    if (room.doors.w) this.doors[room.doors.w].exit = true;

    this.exit = roomId;
  }
}

module.exports = MazeKeyGen;
