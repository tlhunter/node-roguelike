const MAX_X = 21;
const MAX_Y = 21;

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
    this.entrance = null;
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
  }

  generate() {
    this.reset();

    const r1 = this.addRoom(this.seed.x, this.seed.y);
    this.entrance = r1;
    const r2 = this.addRoom(this.seed.x, this.seed.y - 1);
    const d1 = this.addDoor([r1, r2]);
    const l1 = this.lock(d1, r1);
    const r3 = this.addRoom(this.seed.x + 1, this.seed.y - 1);
    const d2 = this.addDoor([r2, r3]);

    const width = this.bounds.e - this.bounds.w + 1;
    const height = this.bounds.s - this.bounds.n + 1;

    const xShift = this.bounds.w;
    const yShift = this.bounds.n;

    for (const room of this.rooms) {
      room.x -= xShift;
      room.y -= yShift;
    }

    return {
      size: {
        width,
        height
      },
      terminals: {
        entrance: this.entrance,
        exit: this.exit
      },
      rooms: this.rooms,
      doors: this.doors,
      keys: this.keys
    };
  }

  addRoom(x, y) {
    const roomId = this.rooms.length;

    this.stretch(x, y);

    this.rooms.push({
      id: roomId,
      x,
      y,
      keysInRoom: [],
      doors: {
        n: null,
        e: null,
        s: null,
        w: null
      }
    });

    return roomId;
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

  /**
   * @param rooms Array of two door IDs
   *
   * @return doorId
   */
  addDoor(rooms) {
    const doorId = this.doors.length;
    const room1 = this.rooms[rooms[0]];
    const room2 = this.rooms[rooms[1]];
    let orientation = null;

    if (room1.x === room2.x && room1.y === room2.y - 1) {
      // R1 north of R2
      orientation = 'v';
      room1.doors.s = doorId;
      room2.doors.n = doorId;
    } else if (room1.x === room2.x + 1 && room1.y === room2.y) {
      // R1 east of R2
      orientation = 'h';
      room1.doors.w = doorId;
      room2.doors.e = doorId;
    } else if (room1.x === room2.x && room1.y === room2.y + 1) {
      // R1 south of R2
      orientation = 'v';
      room1.doors.n = doorId;
      room2.doors.s = doorId;
    } else if (room1.x === room2.x - 1 && room1.y === room2.y) {
      // R1 west of R2
      orientation = 'h';
      room1.doors.e = doorId;
      room2.doors.w = doorId;
    } else {
      throw new Error('Rooms must be adjacent');
    }

    this.doors.push({
      id: doorId,
      key: null,
      orientation,
      rooms
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
}

module.exports = MazeKeyGen;
