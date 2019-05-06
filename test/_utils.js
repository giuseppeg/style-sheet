import { flush } from '../src/server'

export function resolverToString(resolver) {
  return resolver.getStyleSheet().getTextContent()
}
