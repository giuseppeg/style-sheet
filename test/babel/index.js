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

test('plugin', async t => {
  let { code } = await transform('./fixtures/simple.js')
  t.snapshot(code, 'simple - code')
  t.snapshot(getCss(), 'simple - css')
  ;({ code } = await transform('./fixtures/missingImport.js'))
  t.snapshot(code, 'missing import - code')
  t.snapshot(getCss(), 'missing import - css')
  ;({ code } = await transform('./fixtures/missingImport.js', {
    plugins: [plugin, '@babel/plugin-transform-react-jsx'],
  }))
  t.snapshot(code, 'missing import, transformed jsx - code')
  t.snapshot(getCss(), 'missing import, transformed jsx - css')
})
