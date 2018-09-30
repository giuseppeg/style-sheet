// Fork of https://github.com/jxnblk/object-style
// which is MIT (c) jxnblk

import hashFn from 'fnv1a'

export function createClassName(property, value, descendants, media) {
  return `dss_${hashFn(property + descendants + media).toString(36)}-${hashFn(
    value
  ).toString(36)}`
}

const hyphenate = s => s.replace(/[A-Z]|^ms/g, '-$&').toLowerCase()

export function createRule(className, property, value, descendants, media) {
  const cls = '.' + className
  const selector = descendants
    ? descendants.replace(/^&/, cls).replace(/&/g, cls)
    : cls
  const rule = selector + '{' + hyphenate(property) + ':' + value + '}'
  if (!media) return rule
  return media + '{' + rule + '}'
}

const parse = (obj, descendants, media, opts) => {
  const rules = {}

  for (const key in obj) {
    const value = obj[key]
    if (value === null || value === undefined) continue
    switch (typeof value) {
      case 'object':
        const parsed =
          key.charAt(0) === '@'
            ? parse(value, descendants, key, opts)
            : parse(value, descendants + key, media, opts)
        Object.assign(rules, parsed)
        continue
      case 'number':
      case 'string':
        const className = createClassName(key, value, descendants, media)
        if (rules[className]) {
          return
        }
        const rule = createRule(className, key, value, descendants, media)
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
