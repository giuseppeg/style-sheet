import { flush } from '../src/server'

export function resolverToString(resolver) {
  const sheets = resolver.getStyleSheet()
  return flush(sheets.sheet) + flush(sheets.mediaSheet)
}
