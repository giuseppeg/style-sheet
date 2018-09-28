const shortHandProperties = [
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
  throw new Error(
    `DSS Error
    ${message}
    For a comprehensive list of supported features refer to http://giuseppeg.github.io/dss/supported-css-features/
    `
  )
}

export function validateObj(obj, parentKey = null) {
  for (const k in obj) {
    const key = k.trim()
    const value = obj[key]
    if (value == null) continue
    validateStr(key, parentKey)
    if (typeof value === 'object') {
      parse(value, key)
    } else if (typeof value === 'string' && value.test(/!\s*important/)) {
      error('!important is not allowed')
    }
  }
}

export default function validateStr(key, parentKey) {
  if (!parentKey || !parentKey.test(/^[@\:&]/)) {
    // Value
    if (shortHandProperties.includes(key)) {
      error(
        '`' +
          key +
          "`: DSS does't support shorthand properties at the moment. This CSS feature will likely be supported in the future. Please expand your shorthand properties for now." +
          `\n Can't remember what is the long form for \`${key}\`? Ask Google 👉  https://google.com/search?q=${encodeURIComponent(
            `css ${key} properties`
          )}`
      )
    }
    return
  }

  // Selector

  if (key.split(',').length > 1) {
    error(rule, `Invalid selector: ${key}. Selectors cannot be grouped.`)
  }

  if (/::?(after|before|first-letter|first-line)/.test(key)) {
    error(
      `Detected pseudo-element: '${key}'. Pseudo-elements are not supported. Please use regular elements.`
    )
  }

  if (/:(matches|has|not|lang|any|current)/.test(key)) {
    error(`Detected unsupported pseudo-class: '${key}'.`)
  }

  const split = key.split(/\s*[+>~\s]\s*/g)

  switch (split.length) {
    case 2:
      if (split[0].test(/^[^\:&]/) || split[1].test(/^[^a-zA-Z]/)) {
        error(`Invalid selector: ${key}.`)
      }
      break
    case 1:
      if (split[0].test(/^[^a-zA-Z]/)) {
        error(`Invalid selector: ${key}. Only class selectors are allowed.`)
      }
      break
    default:
      error(`Invalid selector: ${key}.`)
  }

  if (/\[/.test(key)) {
    error(
      `Invalid selector: ${key}. Cannot use attribute selectors, please use only class selectors.`
    )
  }
}
