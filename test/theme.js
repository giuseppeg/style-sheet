import test from 'ava'
import { create as _create } from '../src/factory'
import { resolverToString } from './_utils'

const create = opts =>
  _create({
    theme: {
      space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
      fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
      colors: {
        primary: 'red',
        dark: {
          primary: 'hotpink',
        },
      },
    },
    ...opts,
  })

test('creates theme', t => {
  const { StyleSheet, StyleResolver } = create()

  const result = StyleSheet.create({
    root: {
      marginLeft: 2,
      float: 'right',
      color: 'primary',
      m: 5,
      padding: '20px',
      fontSize: [0, 1, 4],
    },
  })

  StyleResolver.resolve(result.root)
  t.snapshot(resolverToString(StyleResolver))
})
