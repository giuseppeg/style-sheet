export default function createSheet() {
  const cssRules = { length: 0 }
  return {
    insertRule(rule, index = cssRules.length) {
      if (index > cssRules.length) {
        throw new Error('IndexSizeError')
      }
      cssRules[index] = { cssText: rule }
      const insertedIndex = index
      if (index === cssRules.length) {
        cssRules.length++
      }
      return insertedIndex
    },
    cssRules,
  }
}

export function flush(sheet) {
  const css = Array.prototype.reduce.call(
    sheet.cssRules,
    function(css, rule) {
      return css + rule.cssText
    },
    ''
  )
  sheet.cssRules = { length: 0 }
  return css
}
