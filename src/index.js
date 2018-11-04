import { create } from './factory'
import { createSheet as createServerSheet, flush } from './server'
import { createCreateElement } from './createElement'

const isBrowser = typeof window !== 'undefined'

const createSheets = () => {
  let style
  let mediaStyle
  let linkStyle = null

  if (isBrowser) {
    style = document.querySelector('#__style_sheet__')
    if (!style) {
      style = document.createElement('style')
      document.head.appendChild(style)
    }
    mediaStyle = document.querySelector('#__style_sheet_media__')
    if (!mediaStyle) {
      mediaStyle = document.createElement('style')
      document.head.appendChild(mediaStyle)
    }
    linkStyle = document.querySelector('#__style_sheet_extracted__')
  } else {
    style = { sheet: createServerSheet() }
    mediaStyle = { sheet: createServerSheet() }
  }

  return {
    get sheet() {
      return style.sheet
    },
    get mediaSheet() {
      return mediaStyle.sheet
    },
    linkSheet: linkStyle && linkStyle.sheet,
  }
}

const sheets = createSheets()

export const { StyleSheet, StyleResolver } = create(sheets)
export function flushServer() {
  return [
    { id: '__style_sheet__', css: flush(sheets.sheet) },
    { id: '__style_sheet_media__', css: flush(sheets.mediaSheet) },
  ]
}

export const createElement = createCreateElement({ StyleSheet, StyleResolver })
