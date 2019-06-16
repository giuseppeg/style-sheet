/* global __dirname:readonly */
import path from 'path'
import test from 'ava'
import { transformFileSync } from '@babel/core'
import plugin, { getCss } from '../../src/babel'

const transform = (file, opts = {}) =>
  transformFileSync(path.resolve(__dirname, file), {
    plugins: [plugin],
    babelrc: false,
    ...opts,
  })

test.serial('plugin', async t => {
  const { code } = await transform('./fixtures/simple.js')
  t.snapshot(code)
  t.snapshot(getCss())
})

test.serial('missing import', async t => {
  const { code } = await transform('./fixtures/missingImport.js')
  t.snapshot(code)
  t.snapshot(getCss())
})

test.serial('missing import - jsx', async t => {
  const { code } = await transform('./fixtures/missingImport.js', {
    plugins: [plugin, '@babel/plugin-transform-react-jsx'],
  })
  t.snapshot(code)
  t.snapshot(getCss())
})
