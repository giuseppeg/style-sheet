if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/prod/factory.js')
} else {
  module.exports = require('./dist/dev/factory.js')
}
