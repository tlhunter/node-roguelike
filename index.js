module.exports = {
  level: {
    roguelike: require('./level/roguelike'),
    gridKeys: require('./level/gridKeys'),
    metroidvania: require('./level/metroidvania')
  },
  room: {
    oddSquare: require('./room/oddSquare')
  },
  utility: {
    grid: require('./utility/grid'),
    random: require('./utility/random')
  }
};
