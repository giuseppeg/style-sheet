function Sheet() {
  this.cssRules = { length: 0 }
  this.insertRule = (rule, index = this.cssRules.length) => {
    if (index > this.cssRules.length) {
      throw new Error('IndexSizeError')
    }
    this.cssRules[index] = { cssText: rule }
    const insertedIndex = index
    if (index === this.cssRules.length) {
      this.cssRules.length++
    }
    return insertedIndex
  }
}

export function createSheet() {
  return new Sheet()
}

export function cssRulesToString(rules) {
  return Array.prototype.reduce.call(
    rules,
    // eslint-disable-next-line prefer-arrow-callback
    function(css, rule) {
      return css + rule.cssText
    },
    ''
  )
}

export function flush(sheet) {
  if (typeof window !== 'undefined') {
    throw new Error('This method is only avaliable server side.')
  }
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
