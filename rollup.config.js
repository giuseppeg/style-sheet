import babel from 'rollup-plugin-babel'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const NODE_ENV = process.env.NODE_ENV || 'development'
const outputFile =
  NODE_ENV === 'production' ? './dist/prod.js' : './dist/dev.js'

export default {
  input: './src/index.js',
  output: {
    file: outputFile,
    format: 'umd',
    name: 'styleSheet',
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    resolve({
      main: true,
      browser: true,
    }),
    commonjs(),
  ],
}
