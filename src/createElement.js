// eslint-disable-next-line import/no-unresolved
import React from 'react'

export default function createCreateElement({ StyleSheet, StyleResolver }) {
  return function(tag, props, ...children) {
    if (props && props.css) {
      const { css, className, ...rest } = props
      let rules = []
      if (Array.isArray(css)) {
        rules = css.map(rule => StyleSheet.create({ rule }).rule)
      } else {
        rules.push(StyleSheet.create({ rule: css }).rule)
      }
      if (className) {
        // className takes precedence over the css prop
        // this allows parent components to style the current one.
        rules.push(
          className.indexOf('dss_') === -1 ? [className] : className.split(' ')
        )
      }
      rest.className = StyleResolver.resolve(rules)
      return React.createElement(tag, rest, ...children)
    }
    return React.createElement(tag, props, ...children)
  }
}
