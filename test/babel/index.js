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
  const { code } = await transform('./fixtures/simple.js')
  t.snapshot(code)
  t.snapshot(getCss())
})
