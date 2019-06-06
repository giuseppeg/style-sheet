// eslint-disable-next-line import/no-unresolved
import React from 'react'

export default function createCreateElement({ StyleSheet, StyleResolver }) {
  return function(tag, props, ...children) {
    if (props && props.css) {
      const { css, className, ...rest } = props
      let rules = []
      if (Array.isArray(css)) {
        rules = css.map(rule => {
          if (rule.__cssProp) {
            return rule.__cssProp
          }
          return StyleSheet.create({ rule }).rule
        })
      } else if (css.__cssProp) {
        rules.push(css.__cssProp)
      } else {
        rules.push(StyleSheet.create({ rule: css }).rule)
      }
      if (className) {
        // className takes precedence over the css prop
        // this allows parent components to style the current one.
        rules.push(
          /dss\d+_/.test(className) ? className.split(' ') : [className]
        )
      }
      rest.className = StyleResolver.resolve(rules)
      return React.createElement(tag, rest, ...children)
    }
    return React.createElement(tag, props, ...children)
  }
}
