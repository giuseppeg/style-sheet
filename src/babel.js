import evaluateSimple from 'babel-helper-evaluate-path'
import evaluateComplex from 'linaria/lib/babel/evaluate'
import { create } from './'
import { createSheet, cssRulesToString } from './server'

const sheets = {
  sheet: createSheet(),
  mediaSheet: createSheet(),
}

const { StyleSheet, StyleResolver } = create(sheets)

export function getCss() {
  return [
    cssRulesToString(sheets.sheet.cssRules),
    cssRulesToString(sheets.mediaSheet.cssRules),
  ].join(' ')
}

export default function(babel) {
  return {
    name: 'style-sheet/babel',
    visitor: {
      ImportDeclaration(path, state) {
        // if (path.node.source.value !== './style-sheet') {
        //   return
        // }
        const specifier = path.get('specifiers').find(specifier => {
          return (
            specifier.isImportSpecifier() &&
            specifier.get('imported').node.name === 'StyleSheet'
          )
        })
        if (!specifier) {
          return
        }

        const binding = path.scope.getBinding(specifier.node.local.name)

        if (!binding || !Array.isArray(binding.referencePaths)) {
          return
        }

        binding.referencePaths
          .map(referencePath => referencePath.parentPath.parentPath)
          .forEach(path => {
            if (path.isCallExpression()) {
              processReferencePath(babel, path, state)
            }
          })
      },
    },
  }
}

function processReferencePath(babel, path, state) {
  // From
  //
  //   StyleSheet.create({
  //     root: {
  //       color: 'red'
  //     }
  //   })
  //
  // grabs
  //
  //   {
  //     root: {
  //       color: 'red'
  //     }
  //   }
  const rulesPath = path.get('arguments')[0]
  let extractable = []

  // For each property
  //
  //   root: {
  //     color: 'red'
  //   }
  const properties = rulesPath.get('properties')
  properties.forEach(property => {
    // Ignore complex stuff like spread elements for now.
    if (!property.isObjectProperty()) {
      return
    }
    // Try to resolve to static...
    const evaluated = evaluate(babel, property.get('value'), state)
    if (evaluated.value === null) {
      return
    }
    extractable.push({
      path: property,
      ...evaluated,
    })
  })

  // If we couldn't resolve anything we exit.
  if (extractable.length === 0) {
    return
  }
}

function compileRule(rule) {
  const compiled = StyleSheet.create({ static: rule }).static
  StyleResolver.resolve(compiled)
  return compiled
}

function evaluate(babel, path, state) {
  let result = evaluateSimple(path)
  if (result.confident) {
    return {
      value: compileRule(result.value),
      dependencies: [],
    }
  }

  try {
    result = evaluateComplex(
      path,
      babel.types,
      state.file.opts.filename,
      text => {
        return babel.transformSync(text, {
          babelrc: false,
          filename: state.file.opts.filename,
          plugins: [
            // Include this plugin to avoid extra config when using { module: false } for webpack
            '@babel/plugin-transform-modules-commonjs',
            '@babel/plugin-proposal-export-namespace-from',
            // We don't support dynamic imports when evaluating, but don't wanna syntax error
            // This will replace dynamic imports with an object that does nothing
            require.resolve('linaria/lib/babel/dynamic-import-noop'),
          ],
          exclude: /node_modules/,
        })
      }
    )
    if (result.value !== null) {
      result.value = compileRule(result.value)
    }
  } catch (e) {
    result = { value: null, dependencies: [] }
  }

  return result
}
