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

export function cssRulesToString(rules) {
  return Array.prototype.reduce.call(
    rules,
    function(css, rule) {
      return css + rule.cssText
    },
    ''
  )
}

export function flush(sheet) {
  const css = cssRulesToString(sheet.cssRules)
  sheet.cssRules = { length: 0 }
  return css
}

export function fromServer(sheets) {
  let css = ''
  const { sheet, mediaSheet, linkSheet } = sheets

  // We likely are server side rendering.
  if (!sheet.ownerNode) {
    return css
  }

  css =
    (sheet.ownerNode.textContent || '') +
    (mediaSheet.ownerNode.textContent || '')

  if (linkSheet) {
    css += cssRulesToString(linkSheet.cssRules)
  }

  return css
}
