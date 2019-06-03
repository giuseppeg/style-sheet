import { create } from './factory'

function getSheet() {
  if (typeof window === 'undefined') {
    return null
  }
  let element = document.querySelector('#__style_sheet__')
  if (!element) {
    element = document.createElement('style')
    element.id = '__style_sheet__'
    document.head.appendChild(element)
  }
  return element.sheet
}

export const { StyleSheet, StyleResolver, setI18nManager } = create({
  sheet: getSheet(),
})

export function flushServer() {
  return {
    id: '__style_sheet__',
    css: StyleResolver.getStyleSheet().getTextContent(),
  }
}
