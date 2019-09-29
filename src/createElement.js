import React from 'react'

export default function createCreateElement(
  { StyleSheet, StyleResolver },
  stylePropName = 'css'
) {
  return function(tag, props, ...children) {
    if (props && props[stylePropName]) {
      const styles = props[stylePropName]
      delete props[stylePropName]
      const className = props.className
      delete props.className

      let rules = []
      if (Array.isArray(styles)) {
        rules = styles.map(rule => {
          if (rule.__styleProp) {
            return rule.__styleProp
          }
          return StyleSheet.create({ rule }).rule
        })
      } else if (styles.__styleProp) {
        rules.push(styles.__styleProp)
      } else {
        rules.push(StyleSheet.create({ rule: styles }).rule)
      }
      if (className) {
        // className takes precedence over the style prop
        // this allows parent components to style the current one.
        rules.push(
          /dss\d+_/.test(className) ? className.split(' ') : [className]
        )
      }
      props.className = StyleResolver.resolve(rules)
    }
    return React.createElement(tag, props, ...children)
  }
}
