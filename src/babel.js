import evaluate from 'linaria/lib/babel/evaluate'

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
  const stylesPath = path.get('arguments')[0]
  const { value, dependencies } = evaluate(
    stylesPath,
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
  console.log(value, dependencies)
}
