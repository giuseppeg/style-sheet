import test from 'ava'
import setup from '../src/createElement'

const libMock = {
  StyleSheet: {
    create(rules) {
      return {
        rule: Object.entries(rules.rule).map(([key, val]) => {
          return `${key.substring(0, 3)}-${val.substring(0, 3)}`
        }),
      }
    },
  },
  StyleResolver: {
    resolve(styles) {
      return styles.reduce((acc, val) => acc.concat(val), []).join(' ')
    },
  },
}
const createElement = setup(libMock, 'css')

test('works just with a tag', t => {
  t.snapshot(createElement('div'))
})

test('works without props', t => {
  t.snapshot(createElement('div', null, [createElement('div')]))
})

test('works with empty', t => {
  t.snapshot(createElement('div', {}))
})

test('works with empty style prop', t => {
  t.snapshot(createElement('div', { css: {} }))
})

test('works with simple style prop', t => {
  t.snapshot(createElement('div', { css: { color: 'red', display: 'block' } }))
})

test('works with style prop as array', t => {
  t.snapshot(createElement('div', { css: [] }))
  t.snapshot(createElement('div', { css: [{ color: 'red' }] }))
})

test('works with style prop as array with multiple rules', t => {
  t.snapshot(
    createElement('div', { css: [{ color: 'red' }, { display: 'block' }] })
  )
})

test('removes falsy rules', t => {
  t.snapshot(
    createElement('div', {
      css: [{ color: 'red' }, false && { display: 'block' }],
    })
  )
})

test('accepts an existing array of rules', t => {
  t.snapshot(createElement('div', { css: [{ color: 'red' }, ['dis-inl']] }))
})

test('works with precompiled rules', t => {
  t.snapshot(createElement('div', { css: { __styleProp: ['dis-fle'] } }))
  t.snapshot(createElement('div', { css: [{ __styleProp: ['dis-inl'] }] }))
})

test('works with mixed precompiled and normal rules', t => {
  t.snapshot(
    createElement('div', {
      css: [{ __styleProp: ['dis-inl'] }, { color: 'red' }],
    })
  )
})

test('merges with className (put at the end)', t => {
  t.snapshot(
    createElement('div', {
      css: { color: 'red' },
      className: 'mar-top dss10_pad-left',
    })
  )
})
