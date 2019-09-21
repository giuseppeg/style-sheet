import compile from './compile'
import validate from './validate'
import createOrderedCSSStyleSheet from './createOrderedCSSStyleSheet'
import { createSourceMapsEngine } from './source-maps'

const isBrowser = typeof window !== 'undefined'
const isProd = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

function createStyleSheet(rules, opts) {
  const cache = typeof Map === 'undefined' ? null : new Map()
  let sourceMapsEngine
  if (!isProd && !isTest && !isBrowser && typeof Worker !== 'undefined') {
    sourceMapsEngine = createSourceMapsEngine()
  }

  return {
    create: styles => {
      if (cache) {
        const cached = cache.get(styles)
        if (cached) {
          return cached
        }
      }
      const locals = {}

      for (const token in styles) {
        const rule = styles[token]
        if (!isProd) {
          validate(rule, null)
        }
        const compiled = compile(rule, opts)
        Object.assign(rules, compiled)

        locals[token] = Object.keys(compiled)

        // In dev add source maps
        if (!isProd && sourceMapsEngine) {
          locals[token].unshift(
            sourceMapsEngine.create((prefix, id) =>
              opts.sourceMaps.className({ prefix, key: token, id })
            )
          )
        }
      }

      if (cache) {
        cache.set(styles, locals)
      }

      return locals
    },
  }
}

function concatClassName(dest, className) {
  if (className.substr(0, 3) !== 'dss') {
    return {
      shouldInject: false,
      className: `${className} ${dest}`,
      group: null,
    }
  }
  const property = className.substr(0, className.indexOf('-'))
  if (dest.indexOf(property) > -1) {
    return { shouldInject: false, className: dest, group: null }
  }
  return {
    shouldInject: true,
    className: `${dest} ${className}`,
    group: Number(
      className.substring(3, className.indexOf('_')).replace('\\', '')
    ),
  }
}

function createStyleResolver(sheet, rules, opts) {
  let resolved = {}
  let injected = {}

  return {
    getStyleSheet() {
      // On the server we reset the caches.
      if (typeof window === 'undefined') {
        resolved = {}
        injected = {}
      }
      return sheet
    },
    resolve(style) {
      const i18n = opts.i18n || {}
      const stylesToString =
        i18n.isRTL + i18n.doLeftAndRightSwapInRTL + style.join()

      if (resolved[stylesToString]) {
        return resolved[stylesToString]
      }

      let resolvedClassName = ''

      for (let i = style.length - 1; i >= 0; i--) {
        let current = style[i]
        if (!current) {
          continue
        }
        if (typeof current === 'string') {
          current = [current]
        }
        for (let j = 0; j < current.length; j++) {
          let className = current[j]
          let rule

          // resolve i18n rules
          const i18nClassNames = className.split('|')
          let i18nRules
          let i18nIndex
          if (i18nClassNames.length > 1) {
            if (i18n.isRTL && i18n.doLeftAndRightSwapInRTL) {
              i18nIndex = 1
            } else {
              i18nIndex = 0
            }
            i18nRules = rules[className]
            className = i18nClassNames[i18nIndex]
            rule = i18nRules[i18nIndex]
          } else {
            rule = rules[className]
          }

          const result = concatClassName(resolvedClassName, className)
          resolvedClassName = result.className

          if (result.shouldInject && !injected[className]) {
            if (rule) {
              sheet.insertRule(rule, result.group)
              if (i18nRules && !isBrowser) {
                const i18nIndexInverse = i18nIndex ? 0 : 1
                sheet.insertRule(i18nRules[i18nIndexInverse], result.group)
                injected[i18nClassNames[i18nIndexInverse]] = true
              }
            }
            injected[className] = true
          }
        }
      }

      resolvedClassName = resolvedClassName.trim()
      resolved[stylesToString] = resolvedClassName
      return resolvedClassName
    },
  }
}

export function createSheet(document) {
  document = document || typeof window === 'undefined' ? null : window.document
  let sheet = null

  if (document) {
    const style = document.createElement('style')
    document.head.appendChild(style)
    sheet = style.sheet
  }

  return sheet
}

export function create(options = {}) {
  let i18n
  function setI18nManager(manager) {
    i18n = manager
    if (i18n && !isProd) {
      if (typeof i18n.isRTL !== 'boolean') {
        throw new Error('i18n.isRTL must be a boolean.')
      }
      if (typeof i18n.doLeftAndRightSwapInRTL !== 'boolean') {
        throw new Error('i18n.doLeftAndRightSwapInRTL must be a boolean.')
      }
    }
  }
  setI18nManager(options.i18n)

  const sheet = createOrderedCSSStyleSheet(options.sheet || createSheet())
  const rules = {}

  const opts = {
    get i18n() {
      return i18n
    },
  }

  if (!isProd) {
    opts.sourceMaps = Object.assign(
      {
        className: ({ prefix, key, id }) => `${prefix}__${key}-${id}`,
      },
      options.sourceMaps || {}
    )
  }

  return {
    StyleSheet: createStyleSheet(rules, opts),
    StyleResolver: createStyleResolver(sheet, rules, opts),
    setI18nManager,
  }
}
