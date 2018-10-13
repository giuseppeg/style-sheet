if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/prod/index.js')
} else {
  module.exports = require('./dist/dev/index.js')
}
