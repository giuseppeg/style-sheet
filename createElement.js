if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/createElement.cjs.prod.js')
} else {
  module.exports = require('./dist/createElement.cjs.dev.js')
}
