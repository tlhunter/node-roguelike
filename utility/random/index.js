const DICE = /^(?:(\d+)?d(\d+))?\s*([\+\-])?\s*(\d+)?$/;

module.exports = {
  /**
   * Clones and sorts an array randomly
   */
  shuffle(arr) {
    let res = arr.slice(0);
    for (let j, x, i = res.length; i; j = Math.floor(Math.random() * i), x = res[--i], res[i] = res[j], res[j] = x);
    return res;
  },

  /**
   * Clones an array, keeps order but shifts the results. E.g.
   * 0,1,2,3 -> 2,3,0,1
   */
  shift(arr) {
    let res = arr.slice(0);
    return res.splice(this.range(0, res.length)).concat(res);
  },

  /**
   * Get a random integer between min and max, inclusive
   */
  range(min, max) {
    return Math.floor(Math.random() * ((max+1) - min)) + min;
  },

  /**
   * Get a random element from an array
   */
  element(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * Like element(), but with matching weight array
   *
   * Usage: fn([1,2,3,4], [50, 100, 50, 10]);
   */
  elementWeighted(collection, weights) {
    if (collection.length !== weights.length) {
      return null;
    }

    weights = weights.slice(0);

    let total = 0;

    // Each value is now the sum of itself and predecessors
    for (let i = 0; i < weights.length; i++) {
      total += weights[i];
      weights[i] = total;
    }

    let strata = Math.random() * total;
    let element = null;

    for (let i = 0; i < weights.length; i++) {
      if (strata <= weights[i]) {
        element = i;
        break;
      }
    }

    if (element === null) {
      return null;
    }

    return collection[element];
  },

  /**
   * Simulates a dice roll. E.g. 3d8 - 4
   * Accepts: d6, 1d6, 1d6+1, 1d6-1
   * Also accepts constants: -3, 17
   * Whitespace will be stripped out
   * Operators allowed are + and - only.
   */
  dice(syntax, allowNegative = false) {
    const result = DICE.exec(syntax);

    if (!result) {
      throw new TypeError(`Invalid dice syntax: ${syntax}`);
    }


    let [, count, size, operator, mod] = result;

    size = Number(size) || 0;
    count = Number(count) || 0;
    mod = Number(mod) || 0;

    if (!count && size) count = 1;

    let total = 0;

    if (size) {
      for (let i = 0; i < count; i++) {
        total += this.range(1, size);
      }
    }

    if (!operator && mod || operator === '+') {
      total += mod;
    } else if (operator === '-') {
      total -= mod;
    }

    if (total < 0 && !allowNegative) {
      total = 0;
    }

    return total;
  },

  /**
   * Make a boolean decision based on a probability threshold
   */
  decide(threshold) {
    if (threshold >= 1) {
      return true;
    }

    if (threshold <= 0) {
      return false;
    }

    return Math.random() <= threshold;
  }
};
