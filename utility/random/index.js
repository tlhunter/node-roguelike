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
  randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * Like randomElement(), but with matching weight array
   *
   * Usage: fn([1,2,3,4], [50, 100, 50, 10]);
   */
  randomElementWeighted(collection, weights) {
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
