function cssRulesToString(rules) {
  return Array.prototype.reduce.call(
    rules,
    function(css, rule) {
      return css + rule.cssText
    },
    ''
  )
}
