function error(message) {
  throw new Error(`style-sheet: ${message}`)
}

export default function validate(obj) {
  for (const k in obj) {
    const key = k.trim()
    const value = obj[key]
    if (value === null) continue
    const isDeclaration =
      Object.prototype.toString.call(value) !== '[object Object]'
    validateStr(key, isDeclaration)
    if (!isDeclaration) {
      validate(value)
    } else if (typeof value === 'string' && /!\s*important/.test(value)) {
      error('!important is not allowed')
    }
  }
}

export function validateStr(key, isDeclaration) {
  if (isDeclaration) {
    return
  }

  if (key.charAt(0) === '@') {
    return
  }

  // Selector

  if (key.split(',').length > 1) {
    error(`Invalid nested selector: '${key}'. Selectors cannot be grouped.`)
  }

  if (/::?(after|before|first-letter|first-line)/.test(key)) {
    error(
      `Detected pseudo-element: '${key}'. Pseudo-elements are not supported. Please use regular elements.`
    )
  }

  if (/:(matches|has|not|lang|any|current)/.test(key)) {
    error(`Detected unsupported pseudo-class: '${key}'.`)
  }

  const split = key.split(/\s*[+>~]\s*/g)

  switch (split.length) {
    case 2:
      if (split[0].charAt(0) !== ':') {
        error(
          `Invalid nested selector: '${key}'. ` +
            'The left part of a combinator selector must be a pseudo-class eg. `:hover`.'
        )
      }
      if (split[1] !== '&') {
        error(
          `Invalid nested selector: '${key}'. ` +
            'The right part of a combinator selector must be `&`.'
        )
      }
      break
    case 1:
      if (split[0].indexOf(' ') > -1) {
        error(
          `Invalid nested selector: ${key}. Complex selectors are not supported.`
        )
      }
      if (split[0].charAt(0) !== '&') {
        error(
          `Invalid nested selector: '${key}'. ` +
            'A pseudo-class selector should reference its parent with `&` eg. `&:hover {}`.'
        )
      }
      break
    default:
      error(`Invalid nested selector: ${key}.`)
  }

  if (/\[/.test(key)) {
    error(
      `Invalid selector: ${key}. Cannot use attribute selectors, please use only class selectors.`
    )
  }
}
