// Fork of https://github.com/jxnblk/object-style
// which is MIT (c) jxnblk

import hashFn from 'fnv1a'
import { prefix } from 'inline-style-prefixer'
import { unitless, i18n, shortHandProperties } from './data'
import { STYLE_GROUPS } from './createOrderedCSSStyleSheet'

export function createClassName(property, value, descendants, media) {
  const ruleType = getRuleType(property, media)
  return `dss_${ruleType}${hashFn(property + descendants + media).toString(
    36
  )}-${hashFn(String(value)).toString(36)}`
}

const hyphenate = s => s.replace(/[A-Z]|^ms/g, '-$&').toLowerCase()
const strigifyDeclaration = dec => {
  let stringified = ''

  for (const prop in dec) {
    const value = dec[prop]
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        stringified += hyphenate(prop) + ':' + value[i] + ';'
      }
    } else {
      stringified += hyphenate(prop) + ':' + value + ';'
    }
  }
  return stringified
}
export function createRule(className, declaration, descendants, media) {
  const cls = '.' + className
  const selector = descendants
    ? descendants.replace(/^&/, cls).replace(/&/g, cls)
    : cls
  const rule = selector + '{' + strigifyDeclaration(declaration) + '}'
  if (!media) return rule
  return media + '{' + rule + '}'
}

function getRuleType(prop, media) {
  if (shortHandProperties.indexOf(prop) > -1) {
    return media ? STYLE_GROUPS.mediaShorthand : STYLE_GROUPS.shorthand
  }
  return media ? STYLE_GROUPS.mediaAtomic : STYLE_GROUPS.atomic
}

function normalizeValue(value) {
  if (typeof value === 'number') {
    if (value !== 0) {
      return value + 'px'
    }
  } else if (Array.isArray(value)) {
    return value.map(v => {
      if (typeof v === 'number' && v !== 0) {
        return v + 'px'
      }
      return v
    })
  }

  return value
}

function toI18n(lookup, thing) {
  return Object.prototype.hasOwnProperty.call(lookup, thing)
    ? lookup[thing]
    : null
}

const parse = (obj, descendants, media, opts) => {
  const rules = {}

  for (let key in obj) {
    let value = obj[key]
    if (value === null || value === undefined) continue
    switch (Object.prototype.toString.call(value)) {
      case '[object Object]': {
        const parsed =
          key.charAt(0) === '@'
            ? parse(value, descendants, key, opts)
            : parse(value, descendants + key, media, opts)
        Object.assign(rules, parsed)
        break
      }
      default: {
        let className = createClassName(key, value, descendants, media)
        if (rules[className]) {
          break
        }
        if (!unitless[key]) {
          value = normalizeValue(value)
        }
        const declaration = prefix({ [key]: value })
        let rule = createRule(className, declaration, descendants, media)

        if (opts.i18n) {
          const originalProp = key
          const originalValue = value
          key = toI18n(i18n.properties, originalProp)
          value = toI18n(i18n.values, originalValue)
          if (key !== null || value !== null) {
            key = key || originalProp
            value = value || originalValue
            const i18nClassName = createClassName(
              key,
              value,
              descendants,
              media
            )
            // i18n classNames contain both the ltr and rtl version
            // this is resolved at runtime by the StyleResolver
            className = `${className}|${i18nClassName}`

            const declaration = prefix({ [key]: value })
            // i18n rule is an array with two rules the ltr and the rtl one
            // eg. ['.left { margin-left: 10px }', '.right { margin-right: 10px }']
            // At runtime the StyleResolver will pick the correct one.
            rule = [
              rule,
              createRule(i18nClassName, declaration, descendants, media),
            ]
          }
        }
        rules[className] = rule
        break
      }
    }
  }

  return rules
}

export default (obj, opts) => {
  if (!obj) {
    throw new Error('DSS parser invoked without a mandatory styles object.')
  }
  return parse(obj, '', '', opts)
}
