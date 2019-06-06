/**
 * This module is a fork of and modifies: https://git.io/fjceH
 *
 * The original source is (c) Nicolas Gallagher
 * and licensed under the MIT license found a thttps://git.io/fjceS
 */

/**
 * Order-based insertion of CSS.
 *
 * Each rule is associated with a numerically defined group.
 * Groups are ordered within the style sheet according to their number, with the
 * lowest first.
 *
 * Groups are implemented using marker rules. The selector of the first rule of
 * each group is used only to encode the group number for hydration. An
 * alternative implementation could rely on CSSMediaRule, allowing groups to be
 * treated as a sub-sheet, but the Edge implementation of CSSMediaRule is
 * broken.
 * https://developer.mozilla.org/en-US/docs/Web/API/CSSMediaRule
 * https://gist.github.com/necolas/aa0c37846ad6bd3b05b727b959e82674
 */
export default function createOrderedCSSStyleSheet(sheet) {
  let groups = {}
  let selectors = {}

  /**
   * Hydrate approximate record from any existing rules in the sheet.
   */
  if (sheet != null) {
    let group
    Array.prototype.forEach.call(sheet.cssRules, function(cssRule, i) {
      const cssText = cssRule.cssText
      // Create record of existing selectors and rules
      if (cssText.indexOf('style-sheet-group') > -1) {
        group = decodeGroupRule(cssRule)
        groups[group] = { start: i, rules: [cssText] }
      } else {
        const selectorText = getSelectorText(cssText)
        if (selectorText != null) {
          selectors[selectorText] = true
          groups[group].rules.push(cssText)
        }
      }
    })
  }

  function sheetInsert(sheet, group, text) {
    const orderedGroups = getOrderedGroups(groups)
    const groupIndex = orderedGroups.indexOf(group)
    const nextGroupIndex = groupIndex + 1
    const nextGroup = orderedGroups[nextGroupIndex]
    // Insert rule before the next group, or at the end of the stylesheet
    const position =
      nextGroup != null && groups[nextGroup].start != null
        ? groups[nextGroup].start
        : sheet.cssRules.length
    const isInserted = insertRuleAt(sheet, text, position)

    if (isInserted) {
      // Set the starting index of the new group
      if (groups[group].start == null) {
        groups[group].start = position
      }
      // Increment the starting index of all subsequent groups
      for (let i = nextGroupIndex; i < orderedGroups.length; i += 1) {
        const groupNumber = orderedGroups[i]
        const previousStart = groups[groupNumber].start
        groups[groupNumber].start = previousStart + 1
      }
    }

    return isInserted
  }

  function getTextContent() {
    return getOrderedGroups(groups).reduce(function(text, group, index) {
      const rules = groups[group].rules
      return text + (index > 0 ? '\n' : '') + rules.join('\n')
    }, '')
  }

  const OrderedCSSStyleSheet = {
    /**
     * The textContent of the style sheet.
     */
    getTextContent,

    /**
     * Returns the textContent of the style sheet and removes all the rules from it.
     */
    flush() {
      const textContent = getTextContent()
      groups = {}
      selectors = {}
      if (sheet != null) {
         Array.prototype.forEach.call(sheet.cssRules, function (_, i) {
           sheet.deleteRule(i)
         })
      }
      return textContent
    },

    /**
     * Insert a rule into the style sheet
     */
    insertRule(cssText, groupValue) {
      const group = Number(groupValue)

      if (isNaN(group)) {
        throw new Error(
          `${groupValue} - Invalid group. Use OrderedCSSStyleSheet.insertRule(cssText, groupId)`
        )
      }

      // Create a new group.
      if (groups[group] == null) {
        const markerRule = encodeGroupRule(group)
        // Create the internal record.
        groups[group] = { start: null, rules: [markerRule] }
        // Update CSSOM.
        if (sheet != null) {
          sheetInsert(sheet, group, markerRule)
        }
      }

      // selectorText is more reliable than cssText for insertion checks. The
      // browser excludes vendor-prefixed properties and rewrites certain values
      // making cssText more likely to be different from what was inserted.
      const selectorText = getSelectorText(cssText)
      if (selectorText != null && selectors[selectorText] == null) {
        // Update the internal records.
        selectors[selectorText] = true
        groups[group].rules.push(cssText)
        // Update CSSOM.
        if (sheet != null) {
          const isInserted = sheetInsert(sheet, group, cssText)
          if (!isInserted) {
            // Revert internal record change if a rule was rejected (e.g.,
            // unrecognized pseudo-selector)
            groups[group].rules.pop()
          }
        }
      }
    },
  }

  return OrderedCSSStyleSheet
}

/**
 * Helper functions
 */

function encodeGroupRule(group) {
  return `[style-sheet-group="${group}"]{}`
}

function decodeGroupRule(cssRule) {
  return Number(cssRule.selectorText.split('"')[1])
}

function getOrderedGroups(obj) {
  return Object.keys(obj)
    .map(Number)
    .sort((a, b) => (a > b ? 1 : -1))
}

const pattern = /\s*([,])\s*/g
function getSelectorText(cssText) {
  const split = cssText.split('{')
  let selector = split[0].trim()
  selector = selector.startsWith('@media') ? split[1].trim() : selector
  selector = selector.trim()
  return selector !== '' ? selector.replace(pattern, '$1') : null
}

function insertRuleAt(root, cssText, position) {
  try {
    root.insertRule(cssText, position)
    return true
  } catch (e) {
    // JSDOM doesn't support `CSSSMediaRule#insertRule`.
    // Also ignore errors that occur from attempting to insert vendor-prefixed selectors.
    return false
  }
}

export const STYLE_GROUPS = [
  'classic',
  'mediaClassic',

  'shorthand',
  'mediaShorthand',

  'shorthandCombinator',
  'mediaShorthandCombinator',

  'i18nShorthand',
  'mediaI18nShorthand',

  'i18nShorthandCombinator',
  'mediaI18nShorthandCombinator',

  'atomic',
  'mediaAtomic',

  'atomicCombinator',
  'mediaAtomicCombinator',
].reduce((groups, name, index) => {
  groups[name] = index
  return groups
}, {})
