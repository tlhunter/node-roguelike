class GridCollection {
  constructor() {
    this._coords = new Map();
    this._entries = new Set();
  }

  add({x, y}, entry) {
    if (this._entries.has(entry)) return false;

    if (this._coords.has(`${x},${y}`)) return false;

    this._entries.add(entry);
    this._coords.set(`${x},${y}`, entry);

    entry.x = x;
    entry.y = y;

    return true;
  }

  get({x, y}) {
    return this._coords.get(`${x},${y}`) || null;
  }

  has({x, y}) {
    return !!this._coords.get(`${x},${y}`);
  }

  destroyAtCoordinate({x, y}) {
    const entry = this._coords.get(`${x},${y}`);

    if (!entry) return false;

    if (!this._entries.has(entry)) return false;

    this.destroy(entry);

    return true;
  }

  destroy(entry) {
    if (!this._coords.has(`${entry.x},${entry.y}`)) return false;

    if (!this._entries.has(entry)) return false;

    this._coords.delete(`${entry.x},${entry.y}`);
    this._entries.delete(entry);

    return true;
  }

  moveAtCoordinate(old, neo) {
    const entry = this._coords.get(`${old.x},${old.y}`);

    if (!entry) return false;

    if (this._coords.get(`${neo.x},${neo.y}`)) return false;

    this._coords.delete(`${old.x},${old.y}`);
    this._coords.set(`${neo.x},${neo.y}`, entry);

    entry.x = neo.x;
    entry.y = neo.y;

    return true;
  }

  move(entry, neo) {
    if (!this._coords.has(`${entry.x},${entry.y}`)) return false;

    if (this._coords.get(`${neo.x},${neo.y}`)) return false;

    this._coords.delete(`${entry.x},${entry.y}`);
    this._coords.set(`${neo.x},${neo.y}`, entry);

    entry.x = neo.x;
    entry.y = neo.y;

    return true;
  }

  each() {
    return this._entries.values();
  }

  clear() {
    const count = this._entries.size;

    this._entries.clear();
    this._coords.clear();

    return count;
  }

  size() {
    return this._entries.size;
  }
}

module.exports = GridCollection;
