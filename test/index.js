import test from 'ava'
import { create } from '../src/factory'
import { resolverToString } from './_utils'

test('works', t => {
  const { StyleSheet, StyleResolver } = create()
  const result = StyleSheet.create({
    root: {
      color: 'red',
    },
  })

  t.deepEqual(result, {
    root: ['dss3_h28rbs-i0tgik'],
  })
  t.is(StyleResolver.resolve(result.root), 'dss3_h28rbs-i0tgik')
})

test('works with multiple rules', t => {
  const { StyleSheet } = create()
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
  t.snapshot(resolverToString(StyleResolver))
})

test('resolves non unitless numbers', t => {
  const { StyleSheet, StyleResolver } = create()
  const result = StyleSheet.create({
    root: {
      marginTop: 10,
      marginBottom: '20px',
      paddingTop: 0,
      paddingBottom: [5, 30],
      zIndex: 10,
    },
  })

  StyleResolver.resolve(result.root)
  t.snapshot(resolverToString(StyleResolver))
})

// Hashing

test('hashes selectors deterministically', t => {
  const { StyleSheet } = create()
  const result = StyleSheet.create({
    root: {
      color: 'red',
    },
  })

  t.is(result.root[0], 'dss3_h28rbs-i0tgik')
})

test('hashes media queries and descendant selectors', t => {
  const { StyleSheet, StyleResolver } = create()
  const result = StyleSheet.create({
    root: {
      '@media (min-width: 30px)': {
        color: 'red',
      },
      '&:hover': {
        color: 'red',
      },
    },
  })
  StyleResolver.resolve(result.root)
  t.snapshot(resolverToString(StyleResolver))
  t.is(result.root[0], 'dss7_3bdajn-i0tgik')
  t.is(result.root[1], 'dss3_41vss2-i0tgik')
})

test('supports fallback values', t => {
  const { StyleSheet, StyleResolver } = create()
  const styles = StyleSheet.create({
    root: {
      color: ['red', 'rgba(255, 0, 0, 1)'],
    },
  })
  t.deepEqual(styles.root, ['dss3_h28rbs-aulp3c'])
  StyleResolver.resolve(styles.root)
  t.snapshot(resolverToString(StyleResolver))
})

test('adds vendor prefixes', t => {
  const { StyleSheet, StyleResolver } = create()
  const styles = StyleSheet.create({
    root: {
      filter: 'blur(10px)',
    },
  })

  t.deepEqual(styles, {
    root: ['dss3_1jgjtkn-1k19bls'],
  })
  StyleResolver.resolve(styles.root)
  const css = resolverToString(StyleResolver)
  t.is(
    css,
    '[style-sheet-group="3"]{}\n' +
      '.dss3_1jgjtkn-1k19bls{-webkit-filter:blur(10px);filter:blur(10px);}'
  )
})

// test.skip('flush multiple times', t => {
//   const { StyleSheet, StyleResolver } = create()
//   let styles = StyleSheet.create({
//     root: {
//       color: 'red',
//     },
//   })
//   StyleResolver.resolve(styles.root)
//   let sheet = StyleResolver.getStyleSheet()
//   t.is(sheet.cssRules.length, 1)
//   let result = flush(sheet)
//   t.is(sheet.cssRules.length, 0)
//   t.is(StyleResolver.getStyleSheet().sheet.cssRules.length, 0)
//   t.is(result, '.dssh_28rbs-i0tgik{color:red;}')
//
//   styles = StyleSheet.create({
//     root: {
//       color: 'red',
//     },
//   })
//   StyleResolver.resolve(styles.root)
//   sheet = StyleResolver.getStyleSheet().sheet
//   t.is(sheet.cssRules.length, 1)
//   result = flush(sheet)
//   t.is(sheet.cssRules.length, 0)
//   t.is(StyleResolver.getStyleSheet().sheet.cssRules.length, 0)
//   t.is(result, '.dssh_28rbs-i0tgik{color:red;}')
// })
