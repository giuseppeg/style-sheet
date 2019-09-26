import * as dev from './index.dev.js'
import * as prod from './index.prod.js'

export const StyleResolver =
  process.env.NODE_ENV === 'production' ? prod.StyleResolver : dev.StyleResolver
export const StyleSheet =
  process.env.NODE_ENV === 'production' ? prod.StyleSheet : dev.StyleSheet
export const setI18nManager =
  process.env.NODE_ENV === 'production'
    ? prod.setI18nManager
    : dev.setI18nManager
