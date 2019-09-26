module.exports =
  process.env.NODE_ENV === 'production'
    ? require('./index.prod.js')
    : require('./index.dev.js')
