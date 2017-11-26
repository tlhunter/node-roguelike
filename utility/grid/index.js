module.exports = {
  /**
   * Are these two points cardinal adjacent?
   */
  adjacent(p1, p2) {
    return p1.x === p2.x && Math.abs(p1.y - p2.y) === 1 || p1.y === p2.y && Math.abs(p1.x - p2.x) === 1;
  },

  /**
   * Bresenham's Line Algorithm
   *
   * Returns an array of points within the line, inclusive of start/end
   *
   * http://stackoverflow.com/a/4672319/538646
   */
  line(start, end) {
    let points = [];
    let x = start.x;
    let y = start.y;

    if (
      typeof start.x === 'undefined' ||
      typeof start.y === 'undefined' ||
      typeof end.x === 'undefined' ||
      typeof end.y === 'undefined'
    ) {
      console.error(start, end);
      throw new Error("INVALID LINE ARGUMENTS");
    }

    const dx = Math.abs(end.x - x);
    const dy = Math.abs(end.y - y);
    const sx = (x < end.x) ? 1 : -1;
    const sy = (y < end.y) ? 1 : -1;

    let err = dx - dy;

    while (true) {
      points.push({
        x: x,
        y: y
      });

      if (x === end.x && y === end.y) {
        break;
      }

      let e2 = 2 * err;

      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }

      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return points;
  },

  distance(p1, p2) {
    const x_diff = p1.x - p2.x;
    const y_diff = p1.y - p2.y;
    return Math.sqrt(x_diff * x_diff + y_diff * y_diff);
  },

  // No Square Root, just finds the larger x/y distance
  fastDistance(p1, p2) {
    const x_diff = Math.abs(p1.x - p2.x);
    const y_diff = Math.abs(p1.y - p2.y);
    return Math.max(x_diff, y_diff);
  },

  sameSpot(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }
};
