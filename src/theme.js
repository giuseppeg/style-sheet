import { isUnitless, normalizeValue } from './unitless'

const defaultBreakpoints = [40, 52, 64].map(n => n + 'em')

const defaultTheme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
}

const aliases = {
  bg: 'backgroundColor',
  m: 'margin',
  mt: 'marginTop',
  mr: 'marginRight',
  mb: 'marginBottom',
  ml: 'marginLeft',
  mx: 'marginX',
  my: 'marginY',
  p: 'padding',
  pt: 'paddingTop',
  pr: 'paddingRight',
  pb: 'paddingBottom',
  pl: 'paddingLeft',
  px: 'paddingX',
  py: 'paddingY',
}

// const multiples = {
//   marginX: ['marginLeft', 'marginRight'],
//   marginY: ['marginTop', 'marginBottom'],
//   paddingX: ['paddingLeft', 'paddingRight'],
//   paddingY: ['paddingTop', 'paddingBottom'],
//   size: ['width', 'height'],
// }

const scales = {
  color: 'colors',
  backgroundColor: 'colors',
  borderColor: 'colors',
  margin: 'space',
  marginTop: 'space',
  marginRight: 'space',
  marginBottom: 'space',
  marginLeft: 'space',
  marginX: 'space',
  marginY: 'space',
  padding: 'space',
  paddingTop: 'space',
  paddingRight: 'space',
  paddingBottom: 'space',
  paddingLeft: 'space',
  paddingX: 'space',
  paddingY: 'space',
  top: 'space',
  right: 'space',
  bottom: 'space',
  left: 'space',
  gridGap: 'space',
  gridColumnGap: 'space',
  gridRowGap: 'space',
  gap: 'space',
  columnGap: 'space',
  rowGap: 'space',
  fontFamily: 'fonts',
  fontSize: 'fontSizes',
  fontWeight: 'fontWeights',
  lineHeight: 'lineHeights',
  letterSpacing: 'letterSpacings',
  border: 'borders',
  borderTop: 'borders',
  borderRight: 'borders',
  borderBottom: 'borders',
  borderLeft: 'borders',
  borderWidth: 'borderWidths',
  borderStyle: 'borderStyles',
  borderRadius: 'radii',
  borderTopRightRadius: 'radii',
  borderTopLeftRadius: 'radii',
  borderBottomRightRadius: 'radii',
  borderBottomLeftRadius: 'radii',
  borderTopWidth: 'borderWidths',
  borderTopColor: 'colors',
  borderTopStyle: 'borderStyles',
  borderTopLeftRadius: 'radii',
  borderTopRightRadius: 'radii',
  borderBottomWidth: 'borderWidths',
  borderBottomColor: 'colors',
  borderBottomStyle: 'borderStyles',
  borderBottomLeftRadius: 'radii',
  borderBottomRightRadius: 'radii',
  borderLeftWidth: 'borderWidths',
  borderLeftColor: 'colors',
  borderLeftStyle: 'borderStyles',
  borderRightWidth: 'borderWidths',
  borderRightColor: 'colors',
  borderRightStyle: 'borderStyles',
  outlineColor: 'colors',
  boxShadow: 'shadows',
  textShadow: 'shadows',
  zIndex: 'zIndices',
  width: 'sizes',
  minWidth: 'sizes',
  maxWidth: 'sizes',
  height: 'sizes',
  minHeight: 'sizes',
  maxHeight: 'sizes',
  flexBasis: 'sizes',
  size: 'sizes',
  // svg
  fill: 'colors',
  stroke: 'colors',
}

export function resolve(theme, prop, value, options) {
  const { mode, allMedia } = Object.assign(
    {
      mode: 'default',
      allMedia: true,
    },
    options
  )
  const finalProperty = aliases[prop] || prop
  let finalValue = theme[scales[finalProperty]]

  if (!finalValue) {
    return [
      {
        prop: finalProperty,
        value,
        media: null,
        customProperty: null,
      },
    ]
  }

  const breakpoints = theme.breakpoints || defaultBreakpoints

  const mediaQueries = [
    null,
    ...breakpoints.map(n => `@media screen and (min-width: ${n})`),
  ]

  let values = value
  if (!Array.isArray(values)) {
    values = [values]
  }

  if (allMedia) {
    return mediaQueries
      .map((media, index) => {
        const value = values[index]
        return computeRuleInfo(finalValue, finalProperty, value, media, mode)
      })
      .filter(Boolean)
  }

  return values
    .map((value, index) =>
      computeRuleInfo(
        finalValue,
        finalProperty,
        value,
        mediaQueries[index],
        mode
      )
    )
    .filter(Boolean)
}

function computeRuleInfo(themeValue, prop, value, media, mode) {
  let val = themeValue[value]

  if (mode !== 'default' && themeValue[mode]) {
    val = themeValue[mode][value]
  }

  if (val == null) {
    return null
  }

  if (!isUnitless(prop)) {
    val = normalizeValue(val)
  }

  return {
    prop,
    value: val,
    customProperty: `--theme-ui-${prop}-${value}`,
    media,
  }
}

export function applyTheme(theme, rule) {
  for (let prop in rule) {
    let value = rule[prop]
    if (value === null || value === undefined) continue
    switch (Object.prototype.toString.call(value)) {
      case '[object Object]': {
        // const themed =
        //   key.charAt(0) === '@'
        //     ? resolveRule(value, descendants, key, opts)
        //     : resolveRule(value, descendants + key, media, opts)
        // Object.assign(rule, parsed)
        break
      }
      default: {
        const themed = resolve(theme, prop, value)
        themed.forEach(theme => {
          if (!theme.customProperty) {
            return
          }
          if (theme.prop !== prop) {
            delete rule[prop]
          }
          if (theme.media) {
            if (!rule[theme.media]) {
              rule[theme.media] = {}
            }
            rule[theme.media][theme.prop] = `var(${theme.customProperty})`
          } else {
            rule[theme.prop] = `var(${theme.customProperty})`
          }
        })
      }
    }
  }
}

export function getThemeRules(theme, rule) {
  const match = rule.match(/--theme-ui-([^-]+)-([^)]+)/)
  if (!match || match.length !== 3) {
    return []
  }
  const [, prop, value] = match
  const themed = resolve(theme, prop, value)
  const rules = themed.reduce((themeRules, theme) => {
    if (theme.customProperty) {
      const rule = `:root{${theme.customProperty}:${theme.value}}`
      if (theme.media) {
        themeRules.push(`${theme.media}{${rule}}`)
      } else {
        themeRules.push(rule)
      }
    }
    return themeRules
  }, [])
  return rules
}
