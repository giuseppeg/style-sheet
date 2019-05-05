if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/factory.cjs.prod.js')
} else {
  module.exports = require('./dist/factory.cjs.dev.js')
}
