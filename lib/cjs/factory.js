module.exports =
  process.env.NODE_ENV === 'production'
    ? require('./factory.prod.js')
    : require('./factory.dev.js')
