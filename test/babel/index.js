import test from 'ava'
import plugin from '../../src/babel'
import path from 'path'
import { transformFileSync } from '@babel/core'

const transform = (file, opts = {}) =>
  transformFileSync(path.resolve(__dirname, file), {
    plugins: [plugin],
    babelrc: false,
    ...opts,
  })

test('simple', async t => {
  const { code } = await transform('./fixtures/simple.js')
  t.snapshot(code)
})
