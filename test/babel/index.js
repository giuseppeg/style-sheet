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

test('simple', async t => {
  console.log('1')
  const { code } = await transform('./fixtures/simple.js')
  t.snapshot(code)
  t.snapshot(getCss())
  console.log('1')
})

test('missing import', async t => {
  console.log('2')
  const { code } = await transform('./fixtures/missingImport.js')
  t.snapshot(code)
  t.snapshot(getCss())
  console.log('2')
})

test('missing import, transformed jsx', async t => {
  console.log('3')
  const { code } = await transform('./fixtures/missingImport.js', {
    plugins: [plugin, '@babel/plugin-transform-react-jsx'],
  })
  t.snapshot(code)
  t.snapshot(getCss())
  console.log('3')
})
