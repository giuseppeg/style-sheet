export default function createSheet() {
  const cssRules = { length: 0 }
  return {
    insertRule(rule, index = cssRules.length) {
      cssRules[index] = { cssText: rule }
      if (index === cssRules.length) {
        cssRules.length++
      }
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
