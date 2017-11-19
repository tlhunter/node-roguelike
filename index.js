const MAX_X = 201;
const MAX_Y = 201;

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
  }

  generate() {
    this.reset();

    const r1 = this.addRoom(this.seed.x, this.seed.y);
    const r2 = this.addRoom(this.seed.x, this.seed.y - 1);
    const d1 = this.addDoor([r1, r2]);
    const l1 = this.lock(d1, r1);
    const r3 = this.addRoom(this.seed.x + 1, this.seed.y - 1);
    const d2 = this.addDoor([r2, r3]);
    this.setExit(r3);

    const r4 = this.addRoom(this.seed.x - 1, this.seed.y);
    const d3 = this.addDoor([r1, r4]);

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
    const roomId = this.rooms.length;

    this.stretch(x, y);

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

    room1.children.add(room2);
    room2.distance = room1.distance + 1;

    this.doors.push({
      id: doorId,
      key: null,
      orientation,
      exit: false,
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
