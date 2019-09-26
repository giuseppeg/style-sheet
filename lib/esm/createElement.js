import * as dev from './createElement.dev.js'
import * as prod from './createElement.prod.js'

export default process.env.NODE_ENV === 'production' ? prod : dev
