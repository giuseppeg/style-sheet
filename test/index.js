import test from 'ava'
import { create as _create } from '../src'
import { createSheet, cssRulesToString } from '../src/server'

const create = () =>
  _create({
    sheet: createSheet(),
    mediaSheet: createSheet(),
  })

const getCss = resolver =>
  cssRulesToString(resolver.getStyleSheet().sheet.cssRules) +
  cssRulesToString(resolver.getStyleSheet().mediaSheet.cssRules)

test('works', t => {
  const { StyleSheet, StyleResolver } = create()
  const result = StyleSheet.create({
    root: {
      color: 'red',
    },
  })

  t.deepEqual(result, {
    root: ['dss_h28rbs-i0tgik'],
  })
  t.is(StyleResolver.resolve(result.root), 'dss_h28rbs-i0tgik')
})

test('works with multiple rules', t => {
  const { StyleSheet, StyleResolver } = create()
  const result = StyleSheet.create({
    root: {
      color: 'red',
    },
    another: {
      display: 'block',
    },
  })

  t.deepEqual(Object.keys(result), ['root', 'another'])
})

test('resolves &', t => {
  const { StyleSheet, StyleResolver } = create()
  const result = StyleSheet.create({
    root: {
      color: 'red',
      '&:hover': {
        color: 'green',
      },
      ':hover > &': {
        color: 'yellow',
      },
      '@media (min-width: 30px)': {
        '&:hover': {
          color: 'green',
        },
        ':hover > &': {
          color: 'yellow',
        },
      },
    },
  })
  t.snapshot(result.root)
  StyleResolver.resolve(result.root)
  t.snapshot(getCss(StyleResolver))
})

// hashing

test('hashes selectors deterministically', t => {
  const { StyleSheet, StyleResolver } = create()
  const result = StyleSheet.create({
    root: {
      color: 'red',
    },
  })

  t.is(result.root[0], 'dss_h28rbs-i0tgik')
})

test('hashes media queries and descendant selectors', t => {
  const { StyleSheet, StyleResolver } = create()
  const result = StyleSheet.create({
    root: {
      '@media (min-width: 30px)': {
        color: 'red',
      },
      ':hover': {
        color: 'red',
      },
    },
  })

  t.is(result.root[1], 'dss_hcs3go-i0tgik')
})

test('supports fallback values', t => {
  const { StyleSheet, StyleResolver } = create()
  const styles = StyleSheet.create({
    root: {
      color: ['red', 'rgba(255, 0, 0, 1)'],
    },
  })
  t.deepEqual(styles.root, ['dss_h28rbs-aulp3c'])
  StyleResolver.resolve(styles.root)
  t.snapshot(getCss(StyleResolver))
})

test('adds vendor prefixes', t => {
  const { StyleSheet, StyleResolver } = create()
  const styles = StyleSheet.create({
    root: {
      filter: 'blur(10px)',
    },
  })

  t.deepEqual(styles, {
    root: ['dss_1jgjtkn-1k19bls'],
  })
  StyleResolver.resolve(styles.root)
  const css = getCss(StyleResolver)
  t.is(
    css,
    '.dss_1jgjtkn-1k19bls{-webkit-filter:blur(10px);filter:blur(10px);}'
  )
})
