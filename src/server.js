export function flush(sheet) {
  if (typeof window !== 'undefined') {
    throw new Error('This method is only avaliable server side.')
  }
  const css = cssRulesToString(sheet.cssRules)
  sheet.cssRules = { length: 0 }
  return css
}
