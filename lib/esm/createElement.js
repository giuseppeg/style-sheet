import dev from './createElement.dev.js'
import prod from './createElement.prod.js'

export default process.env.NODE_ENV === 'production' ? prod : dev
