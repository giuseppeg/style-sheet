/* global __dirname:readonly */
import path from 'path'
import test from 'ava'
import { transformFileSync } from '@babel/core'
import _plugin, { getCss } from '../../src/babel'

const plugin = [_plugin, { stylePropPackageName: './lib/createElement' }]

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

test.serial('generates i18n styles', async t => {
  const { code } = await transform('./fixtures/i18n.js', {
    plugins: [
      [_plugin, { stylePropPackageName: './lib/createElement', rtl: true }],
    ],
  })
  t.snapshot(code)
  t.snapshot(getCss())
})
