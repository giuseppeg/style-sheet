import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const NODE_ENV = process.env.NODE_ENV || 'development'
const outputFile = fileName =>
  NODE_ENV === 'production'
    ? `./dist/prod/${fileName}.js`
    : `./dist/dev/${fileName}.js`

const plugins = () => [
  replace({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
  }),
  babel({
    exclude: 'node_modules/**',
  }),
  resolve({
    browser: true,
  }),
  commonjs(),
]

export default [
  {
    input: './src/factory.js',
    output: {
      file: outputFile('factory'),
      format: 'umd',
      name: 'styleSheetFactory',
    },
    plugins: plugins(),
  },
  {
    input: './src/index.js',
    output: {
      file: outputFile('index'),
      format: 'umd',
      name: 'styleSheet',
    },
    plugins: plugins(),
  },
  {
    input: './src/babel.js',
    output: {
      file: './dist/babel.js',
      format: 'cjs',
    },
    plugins: [
      resolve({
        browser: false,
      }),
      commonjs(),
    ],
    external: ['linaria/lib/babel/evaluate', 'babel-helper-evaluate-path'],
  },
]
