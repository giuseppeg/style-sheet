import { unitless } from './data'

export function isUnitless(prop) {
  return unitless[prop]
}

export function normalizeValue(value) {
  if (typeof value === 'number') {
    if (value !== 0) {
      return value + 'px'
    }
  } else if (Array.isArray(value)) {
    return value.map(v => {
      if (typeof v === 'number' && v !== 0) {
        return v + 'px'
      }
      return v
    })
  }

  return value
}
