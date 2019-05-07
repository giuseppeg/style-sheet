import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const ENV = process.env.NODE_ENV || 'development'
const ENV_ALIASES = {
  production: 'prod',
  development: 'dev',
  test: 'prod',
}
const ENTRY_FILES = ['factory', 'index', 'createElement']

const plugins = () =>
  [
    replace({
      'process.env.NODE_ENV': JSON.stringify(ENV),
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    resolve({
      browser: true,
    }),
    commonjs(),
    ENV !== 'development' ? terser() : null,
  ].filter(Boolean)

const confCreators = ENTRY_FILES.map(entryName => [
  entryName,
  format => ({
    input: `./src/${entryName}.js`,
    output: {
      format,
      file: `dist/${entryName}.${format}.${ENV_ALIASES[ENV]}.js`,
      compact: ENV === 'production',
    },
    plugins: plugins(),
  }),
])

const EXTERNAL = {
  createElement: ['react'],
  index: ['inline-style-prefixer', 'fnv1a'],
  factory: ['inline-style-prefixer', 'fnv1a'],
}
const CJS_CONFIG = confCreators.map(([entryName, creator]) => ({
  ...creator('cjs'),
  external: EXTERNAL[entryName],
}))

const ESM_CONFIG = confCreators.map(([entryName, creator]) => ({
  ...creator('esm'),
  external: EXTERNAL[entryName],
}))

const GLOBALS = {
  createElement: {
    react: 'React',
  },
}
const UMD_CONFIG = confCreators.map(([entryName, creator]) => {
  const config = creator('umd')
  config.output.name = `styleSheet${
    entryName === 'index'
      ? ''
      : entryName.charAt(0).toUpperCase() + entryName.slice(1)
  }`
  config.output.globals = GLOBALS[entryName]
  return config
})

const BABEL_PLUGIN_CONFIG = {
  input: './src/babel.js',
  output: {
    file: './dist/babel.js',
    format: 'cjs',
    exports: 'named',
  },
  plugins: [
    resolve({
      browser: false,
    }),
    commonjs(),
  ],
  external: ['linaria/lib/babel/evaluate', 'babel-helper-evaluate-path'],
}

export default [
  ...CJS_CONFIG,
  ...ESM_CONFIG,
  ...UMD_CONFIG,
  BABEL_PLUGIN_CONFIG,
]
