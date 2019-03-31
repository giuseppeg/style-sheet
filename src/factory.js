import compile from './compile'
import validate from './validate'
import { fromServer } from './server'

const isBrowser = typeof window !== 'undefined'

function createStyleSheet(rules, opts) {
  const cache = typeof Map === 'undefined' ? null : new Map()
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
        if (process.env.NODE_ENV !== 'production') {
          validate(rule, null)
        }
        const compiled = compile(rule, opts)
        locals[token] = Object.keys(compiled)
        Object.assign(rules, compiled)
      }

      if (cache) {
        cache.set(styles, locals)
      }

      return locals
    },
  }
}

function concatClassName(dest, className) {
  if (className.substr(0, 4) !== 'dss_') {
    return { shouldInject: false, className: `${className} ${dest}` }
  }
  const property = className.substr(0, className.indexOf('-'))
  if (dest.indexOf(property) > -1) {
    return { shouldInject: false, className: dest }
  }
  return { shouldInject: true, className: `${dest} ${className}` }
}

function createStyleResolver(sheets, rules, opts) {
  const { sheet, mediaSheet } = sheets
  const serverStyles = fromServer(sheets)
  let resolved = {}
  let injected = {}

  return {
    getStyleSheet() {
      // On the server we reset the caches.
      if (typeof window === 'undefined') {
        resolved = {}
        injected = {}
      }
      return sheets
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
            if (rule && serverStyles.indexOf(className) === -1) {
              const targetSheet = rule.charAt(0) === '@' ? mediaSheet : sheet
              targetSheet.insertRule(rule)
              if (i18nRules && !isBrowser) {
                const i18nIndexInverse = i18nIndex ? 0 : 1
                targetSheet.insertRule(i18nRules[i18nIndexInverse])
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

export function createSheets(document = window.document) {
  const style = document.createElement('style')
  const mediaStyle = document.createElement('style')
  document.head.appendChild(style)
  document.head.appendChild(mediaStyle)

  return {
    get sheet() {
      return style.sheet
    },
    get mediaSheet() {
      return mediaStyle.sheet
    },
  }
}

export function create(options = {}) {
  let i18n
  function setI18nManager(manager) {
    i18n = manager
    if (i18n && process.env.NODE_ENV !== 'production') {
      if (typeof i18n.isRTL !== 'boolean') {
        throw new Error('i18n.isRTL must be a boolean.')
      }
      if (typeof i18n.doLeftAndRightSwapInRTL !== 'boolean') {
        throw new Error('i18n.doLeftAndRightSwapInRTL must be a boolean.')
      }
    }
  }
  setI18nManager(options.i18n)

  const sheets = options.sheets || createSheets()
  const rules = {}

  if (!sheets.sheet || !sheets.mediaSheet) {
    throw new Error(
      `Create must be called with an object that contains two objects, sheet and mediaSheet,
      that implement the CSSStyleSheet interface.

      To preserve determinism media queries should be inserted in a separate style sheet,
      after the main sheet.
    `
    )
  }

  // Moves link tag between the two style tags so that:
  // 1. new regular rules are appended before
  // 2. new at rules are appended after
  // This is necessary to preserve determinism due to specificity.
  const linkNode = sheets.linkSheet && sheets.linkSheet.ownerNode
  if (linkNode) {
    linkNode.parentNode.insertBefore(linkNode, sheets.mediaSheet.ownerNode)
  }

  const opts = {
    get i18n() {
      return i18n
    },
  }

  return {
    StyleSheet: createStyleSheet(rules, opts),
    StyleResolver: createStyleResolver(sheets, rules, opts),
    setI18nManager,
  }
}
