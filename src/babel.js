import evaluateSimple from 'babel-helper-evaluate-path'
import evaluateComplex from 'linaria/lib/babel/evaluate'
import { create } from './'
import { createSheet, cssRulesToString } from './server'

const sheets = {
  sheet: createSheet(),
  mediaSheet: createSheet(),
}

const { StyleSheet, StyleResolver } = create(sheets)

// This function returns the extracted CSS to save in a .css file.
// It must be called after all the files are processed by Babel.
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

        // Find all the references to StyleSheet.create.
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
  const t = babel.types
  const cloneNode = t.cloneNode || t.cloneDeep
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
  const extractableProperties = []

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
    // evaluate() will also compile static styles, which are the ones
    // that we will extract to file.
    const evaluated = evaluate(babel, property.get('value'), state)
    if (evaluated.value === null) {
      return
    }
    extractableProperties.push(
      t.objectProperty(
        cloneNode(property.get('key').node),
        t.arrayExpression(evaluated.value.map(value => t.stringLiteral(value)))
      )
    )
    property.remove()
  })

  // If we couldn't resolve anything we exit.
  if (extractableProperties.length === 0) {
    return
  }

  const extractedStylesObjectLiteral = t.objectExpression(extractableProperties)

  // When some rules could not be extracted (maybe there are dynamic styles)
  // we will spread StyleSheet.create({...}) to the replacement object
  //
  //   ({
  //    static: [/* ... */],
  //    ...StyleSheet.create({
  //      someDynamicRule: {
  //        color: props.color,
  //      }
  //    })
  //   })
  if (properties.length !== extractableProperties.length) {
    extractedStylesObjectLiteral.properties.push(
      t.spreadElement(cloneNode(path.node))
    )
  }
  path.replaceWith(extractedStylesObjectLiteral)
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
