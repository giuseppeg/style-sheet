module.exports =
  process.env.NODE_ENV === 'production'
    ? require('./createElement.prod.js')
    : require('./createElement.dev.js')
