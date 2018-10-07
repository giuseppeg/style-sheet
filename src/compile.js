// Fork of https://github.com/jxnblk/object-style
// which is MIT (c) jxnblk

import hashFn from 'fnv1a'
import { prefix } from 'inline-style-prefixer'

export function createClassName(property, value, descendants, media) {
  return `dss_${hashFn(property + descendants + media).toString(36)}-${hashFn(
    value
  ).toString(36)}`
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

const parse = (obj, descendants, media, opts) => {
  const rules = {}

  for (const key in obj) {
    const value = obj[key]
    if (value === null || value === undefined) continue
    switch (Object.prototype.toString.call(value)) {
      case '[object Object]':
        const parsed =
          key.charAt(0) === '@'
            ? parse(value, descendants, key, opts)
            : parse(value, descendants + key, media, opts)
        Object.assign(rules, parsed)
        continue
      case '[object Number]':
      case '[object Array]':
      case '[object String]':
        const className = createClassName(key, value, descendants, media)
        if (rules[className]) {
          return
        }
        const declaration = prefix({ [key]: value })
        const rule = createRule(className, declaration, descendants, media)
        rules[className] = rule
    }
  }

  return rules
}

export default obj => {
  if (!obj) {
    throw new Error('DSS parser invoked without a mandatory styles object.')
  }
  return parse(obj, '', '')
}
