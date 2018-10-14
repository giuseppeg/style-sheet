export const shortHandProperties = [
  'animation',
  'background',
  'border',
  'border-bottom',
  'border-left',
  'border-radius',
  'border-right',
  'border-top',
  'column-rule',
  'columns',
  'flex',
  'flex-flow',
  'font',
  'grid',
  'grid-area',
  'grid-column',
  'grid-row',
  'grid-template',
  'list-style',
  'margin',
  'offset',
  'outline',
  'overflow',
  'padding',
  'place-content',
  'place-items',
  'place-self',
  'text-decoration',
  'transition',
]

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
    // Value
    if (shortHandProperties.includes(key)) {
      error(
        '`' +
          key +
          "`: style-sheet does't support shorthand properties at the moment. This CSS feature will likely be supported in the future. Please expand your shorthand properties for now." +
          `\n Can't remember what is the long form for \`${key}\`? Ask Google 👉  https://google.com/search?q=${encodeURIComponent(
            `css ${key} properties`
          )}`
      )
    }
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
