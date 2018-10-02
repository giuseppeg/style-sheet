if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/prod')
} else {
  module.exports = require('./dist/dev')
}
