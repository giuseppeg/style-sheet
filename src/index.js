import compile from './compile'
import validate from './validate'

const CLASSNAME_PREFIX = CLASSNAME_PREFIX

function createStyleSheet(rules) {
  return {
    create: styles => {
      const locals = {}

      for (const token in styles) {
        const rule = styles[token]
        // TODO rememeber to validate only in DEV
        validate(rule, null)
        const compiled = compile(rule)
        locals[token] = Object.keys(compiled)
        Object.assign(rules, compiled)
      }

      return locals
    },
  }
}

function concatClassName(dest, className) {
  if (className.substr(0, 4) !== CLASSNAME_PREFIX) {
    return { shouldInject: false, className: `${className} ${dest}` }
  }
  const property = className.substr(0, className.indexOf('-'))
  if (dest.indexOf(property) > -1) {
    return { shouldInject: false, className: dest }
  }
  return { shouldInject: true, className: `${dest} ${className}` }
}

function createStyleResolver(sheet, rules) {
  const fromServer = (sheet.ownerNode || {}).textContent || ''
  const resolved = {}
  const injected = {}

  return {
    resolve(style) {
      const stylesToString = String(style)

      if (resolved[stylesToString]) {
        return resolved[stylesToString]
      }

      let className = ''

      for (let i = style.length - 1; i >= 0; i--) {
        let current = style[i]
        if (!current) {
          continue
        }
        if (typeof current == 'string') {
          current = [current]
        }
        current.forEach(current => {
          const result = concatClassName(className, current)
          className = result.className
          if (result.shouldInject && !injected[current]) {
            if (fromServer.indexOf(current) == -1) {
              sheet.insertRule(rules[current])
            }
            injected[current] = true
          }
        })
      }

      resolved[stylesToString] = className.trim()
      return resolved[stylesToString]
    },
  }
}

function createSheet() {
  const style = document.createElement('style')
  document.head.appendChild(style)
  return style.sheet
}

function create(sheet = createSheet()) {
  const rules = {}

  return {
    StyleSheet: createStyleSheet(rules),
    StyleResolver: createStyleResolver(sheet, rules),
  }
}

export default create
