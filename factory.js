if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/prod/factory')
} else {
  module.exports = require('./dist/dev/factory')
}
