import * as dev from './factory.dev.js'
import * as prod from './factory.prod.js'

export const create =
  process.env.NODE_ENV === 'production' ? prod.create : dev.create
export const createSheet =
  process.env.NODE_ENV === 'production' ? prod.createSheet : dev.createSheet
