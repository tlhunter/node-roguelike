/**
 * Originally written for a game called "Isolated" in collaboration with Andrew Beattie and Greg Schoberth
 *
 * Originally written on June 12, 2013
 * Modernized on November 19, 2017
 * Originally hosted at https://github.com/PhobosRising/javascript-roguelike-map-generator
 */
const WALL = 'wall';
const DOOR = 'door';
const OPEN = 'open';
const EXIT = 'exit';

const DIRECTIONS = ['n', 'e', 's', 'w'];

module.exports = (config = {}) => {
  let MAP_WIDTH = config.width || 20;
  let MAP_HEIGHT = config.height || 20;

  let MIN_ZONES_PER_ROOM = config.minZonesPerRoom || 1;
  let MAX_ZONES_PER_ROOM = config.maxZonesPerRoom || 4;
  let MIN_ROOMS_PER_MAP = config.minRoomsPerMap || 10;
  let MAX_ROOMS_PER_MAP = config.maxRoomsPerMap || 20;

  // If we don't get at least this many random doors, start over
  let NEW_DOOR_MIN_THRESHOLD = config.newDoors || 3;

  // How this really should work is the odds of creating a door are higher as the room id's get farther apart
  let ROOM_ID_DIFF_RANDOM_DOOR_THRESHOLD = config.roomDiff || 3; // How different should two rooms be?
  let ROOM_ID_DIFF_RANDOM_DOOR_ODDS = config.roomDiffOdds || 1/5; // What are the odds we'll act upon this?

  let result = null;
  while (!result) {
    result = build(initialize(MAP_WIDTH, MAP_HEIGHT));
  }
  return result;

  function build(map) {
    // Determin the total number of rooms in the beginning
    const number_of_rooms = rangedRandom(MIN_ROOMS_PER_MAP, MAX_ROOMS_PER_MAP);

    // The cursor is this special little pointer for the next zone being built
    let cursor = {
      x: Math.floor(MAP_WIDTH/2),
      y: Math.floor(MAP_WIDTH/2)
    };

    const exits = {
      n: { // negative Y
        x: cursor.x,
        y: cursor.y
      },
      s: { // positive Y
        x: cursor.x,
        y: cursor.y
      },
      e: { // positive X
        x: cursor.x,
        y: cursor.y
      },
      w: { // negative X
        x: cursor.x,
        y: cursor.y
      }
    };

    // Each placed zone will have its own id
    let zone_id = 0;

    // An array of room id's, and the room locations within it
    const all_room_zones = [];

    // Run this loop once per room we're going to build
    for (let room = 0; room < number_of_rooms; room++) {
      // determine the number of zones in this room at the beginning
      const number_of_zones = rangedRandom(MIN_ZONES_PER_ROOM, MAX_ZONES_PER_ROOM);

      const zones_in_this_room = [];

      // Run this loop once per zone within this room
      for (let zone_number = 0; zone_number < number_of_zones; zone_number++) {
        if (!cursor) {
          return null;
        }
        const zone = map[cursor.x][cursor.y];

        zones_in_this_room.push({
          x: cursor.x,
          y: cursor.y
        });

        zone.open = true;
        zone.room = room;
        zone.zone = zone_id;

        zone_id++;

        if (cursor.x <= exits.w.x) exits.w = cursor;
        if (cursor.x >= exits.e.x) exits.e = cursor;
        if (cursor.y <= exits.n.y) exits.n = cursor;
        if (cursor.y >= exits.s.y) exits.s = cursor;
        cursor = moveCursor(map, cursor);

        if (!cursor) {
          // When this happens, we should just instead start building from somewhere else
          console.log('CURSOR STUCK. Rebuild...');
          return false;
        }
      }

      // Build walls between this room and other rooms / void
      for (const zone_location of zones_in_this_room) {
        buildWallsForZone(map, zone_location);
      }

      all_room_zones[room] = zones_in_this_room;

      // Move cursor to an area outside but next to this room, and add door
      if (room != number_of_rooms-1) {
        cursor = findNakedAdjacent(map, zones_in_this_room);
      }
    }

    // Lets add some random doors between rooms, otherwise it's too linear
    let new_door_count = 0;
    for (const room_zones of all_room_zones) {
      for (const coords of room_zones) {
        if (coords.x === 0 || coords.y === 0 || coords.x >= MAP_WIDTH-1 || coords.y >= MAP_HEIGHT-1) {
          // Don't attempt to build random doors on extremes. Could be more specific though, doesn't always need to be avoided.
          continue;
        }
        const this_zone = map[coords.x][coords.y];
        const this_room_id = this_zone.room;

        let comparedZone = null;

        // South
        comparedZone = map[coords.x][coords.y+1];
        if (comparedZone.open && Math.abs(comparedZone.room - this_room_id) > ROOM_ID_DIFF_RANDOM_DOOR_THRESHOLD && Math.random() <= ROOM_ID_DIFF_RANDOM_DOOR_ODDS) {
          buildDoorBetweenZones(map, coords, {x: coords.x, y: coords.y+1});
          new_door_count++;
        }

        // North
        comparedZone = map[coords.x][coords.y-1];
        if (comparedZone.open && Math.abs(comparedZone.room - this_room_id) > ROOM_ID_DIFF_RANDOM_DOOR_THRESHOLD && Math.random() <= ROOM_ID_DIFF_RANDOM_DOOR_ODDS) {
          buildDoorBetweenZones(map, coords, {x: coords.x, y: coords.y-1});
          new_door_count++;
        }

        // West
        comparedZone = map[coords.x-1][coords.y];
        if (comparedZone.open && Math.abs(comparedZone.room - this_room_id) > ROOM_ID_DIFF_RANDOM_DOOR_THRESHOLD && Math.random() <= ROOM_ID_DIFF_RANDOM_DOOR_ODDS) {
          buildDoorBetweenZones(map, coords, {x: coords.x-1, y: coords.y});
          new_door_count++;
        }

        // East
        comparedZone = map[coords.x+1][coords.y];
        if (comparedZone.open && Math.abs(comparedZone.room - this_room_id) > ROOM_ID_DIFF_RANDOM_DOOR_THRESHOLD && Math.random() <= ROOM_ID_DIFF_RANDOM_DOOR_ODDS) {
          buildDoorBetweenZones(map, coords, {x: coords.x+1, y: coords.y});
          new_door_count++;
        }
      }
    }

    if (new_door_count < NEW_DOOR_MIN_THRESHOLD) {
      console.log("UNMET DOOR THRESHOLD: " + new_door_count + " OF " + NEW_DOOR_MIN_THRESHOLD + ". Rebuild...");
      return false;
    }

    // Build our exits
    let dir = null;
    for (const dir of DIRECTIONS) {
      map[exits[dir].x][exits[dir].y].edges[dir] = EXIT;
      map[exits[dir].x][exits[dir].y].exit = true;
    }

    return {
      map,
      exits,
      rooms: all_room_zones
    };
  }

  // Finds an open zone which is adjacent to one of the supplied zones
  function findNakedAdjacent(map, zones) {
    zones = shuffle(zones);

    for (const current_zone of zones) {
      const newZone = moveCursor(map, current_zone);
      if (newZone) {
        buildDoorBetweenZones(map, current_zone, newZone);
        return newZone;
      }
    }

    return false;
  }

  // Move the cursor to an available adjacent zone
  function moveCursor(map, cursor) {
    let adjacents = shuffle([
      {
        d: 'n', x: 0, y: 1
      }, {
        d: 'e', x: 1, y: 0
      }, {
        d: 's', x: 0, y: -1
      }, {
        d: 'w', x: -1, y: 0
      }
    ]);

    let direction = null;
    let newCursor = null;

    while (direction = adjacents.pop()) {
      newCursor = {
        x: cursor.x + direction.x,
        y: cursor.y + direction.y
      };

      if (newCursor.x < 0 || newCursor.y < 0 || newCursor.x >= MAP_WIDTH || newCursor.y >= MAP_HEIGHT) {
        // When this happens, we should just move the cursor somewhere else
        console.log('CURSOR OUT OF BOUNDS. Rebuild...');
        return null;
      }

      if (!map[newCursor.x][newCursor.y].open) {
        return newCursor;
      }
    }

    return false;
  }

  // Takes the coordinates of a zone, and map info, and works on building
  // walls for that particular zone. Should also update this so that we make
  // sure we're not looking outside the bounds of our array (<0 | >MAX).
  // Also, don't want to blow away doors...
  function buildWallsForZone(map, loc) {
    const room = map[loc.x][loc.y].room;

    // NORTH
    if (map[loc.x][loc.y].edges.n != DOOR) {
      if (loc.y === 0 || !map[loc.x][loc.y-1].open || map[loc.x][loc.y-1].room != room) {
        map[loc.x][loc.y].edges.n = WALL;
      } else {
        map[loc.x][loc.y].edges.n = OPEN;
      }
    }

    // EAST
    if (map[loc.x][loc.y].edges.e != DOOR) {
      if (loc.x >= MAP_WIDTH-1 || !map[loc.x+1][loc.y].open || map[loc.x+1][loc.y].room != room) {
        map[loc.x][loc.y].edges.e = WALL;
      } else {
        map[loc.x][loc.y].edges.e = OPEN;
      }
    }

    // SOUTH
    if (map[loc.x][loc.y].edges.s != DOOR) {
      if (loc.y >= MAP_HEIGHT-1 || !map[loc.x][loc.y+1].open || map[loc.x][loc.y+1].room != room) {
        map[loc.x][loc.y].edges.s = WALL;
      } else {
        map[loc.x][loc.y].edges.s = OPEN;
      }
    }

    // WEST
    if (map[loc.x][loc.y].edges.w != DOOR) {
      if (loc.x === 0 || !map[loc.x-1][loc.y].open || map[loc.x-1][loc.y].room != room) {
        map[loc.x][loc.y].edges.w = WALL;
      } else {
        map[loc.x][loc.y].edges.w = OPEN;
      }
    }
  }
}

// Get a random integer between the supplied min and max
function rangedRandom(min, max) {
  return Math.floor((Math.random() * (max + 1 - min)) + min);
}

// Builds a door between these two (hopefully) adjacent zones
function buildDoorBetweenZones(map, zonePos1, zonePos2) {
  const zone1 = map[zonePos1.x][zonePos1.y];
  const zone2 = map[zonePos2.x][zonePos2.y];

  if (zonePos1.x == zonePos2.x && zonePos1.y > zonePos2.y) {
    // ZONE1 SOUTH OF ZONE2
    zone1.edges.n = DOOR;
    zone2.edges.s = DOOR;
  } else if (zonePos1.x == zonePos2.x && zonePos1.y < zonePos2.y) {
    // ZONE1 NORTH OF ZONE2
    zone1.edges.s = DOOR;
    zone2.edges.n = DOOR;
  } else if (zonePos1.y == zonePos2.y && zonePos1.x > zonePos2.x) {
    // ZONE1 EAST OF ZONE2
    zone1.edges.w = DOOR;
    zone2.edges.e = DOOR;
  } else if (zonePos1.y == zonePos2.y && zonePos1.x < zonePos2.x) {
    // ZONE1 WEST OF ZONE2
    zone1.edges.e = DOOR;
    zone2.edges.w = DOOR;
  } else {
    console.log('BUILD DOOR FAILURE', zone1, zone2);
  }
}

// Randomizes an array
function shuffle(array) {
  const arr = array.slice(); // clone array
  let i = arr.length, j, tempi, tempj;
  if ( i == 0 ) return false;
  while ( --i ) {
   j     = Math.floor( Math.random() * ( i + 1 ) );
   tempi   = arr[i];
   tempj   = arr[j];
   arr[i] = tempj;
   arr[j] = tempi;
  }
  return arr;
}

// Builds a big empty square array, an entire map
function initialize(width, height) {
  const map = [];

  for (let x = 0; x < width; x++) {
    map[x] = [];

    for (let y = 0; y < height; y++) {
      map[x][y] = {
        open: false,
        room: null,
        exit: null,
        zone: null,
        edges: {
          n: null,
          e: null,
          s: null,
          w: null,
        }
      };
    }
  }

  return map;
}
