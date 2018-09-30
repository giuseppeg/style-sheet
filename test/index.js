import test from 'ava'
import _create from '../src'
import createSheet from '../src/server'

const create = () =>
  _create({
    sheet: createSheet(),
    mediaSheet: createSheet(),
  })

test('works', t => {
  const { StyleSheet, StyleResolver } = create()
  const styles = StyleSheet.create({
    root: {
      color: 'red',
    },
  })

  t.snapshot(styles)
  t.snapshot(StyleResolver.resolve(styles.root))
})

// test('works', t => {
//   const result = StyleSheet.create({
//     root: {
//       color: 'red',
//     },
//   })
//
//   t.true(Array.isArray(result.locals.root))
//   t.is(result.rules.length, 1)
// })
//
// test('works with multiple rules', t => {
//   const result = StyleSheet.create({
//     root: {
//       color: 'red',
//     },
//     another: {
//       display: 'block',
//     },
//   })
//
//   t.deepEqual(Object.keys(result.locals), ['root', 'another'])
// })
//
// test('resolves &', t => {
//   const result = StyleSheet.create({
//     root: {
//       color: 'red',
//       '&:hover': {
//         color: 'green',
//       },
//       ':hover > &': {
//         color: 'yellow',
//       },
//       '@media (min-width: 30px)': {
//         '&:hover': {
//           color: 'green',
//         },
//         ':hover > &': {
//           color: 'yellow',
//         },
//       },
//     },
//   })
//
//   t.snapshot(result.rules)
// })
//
// // hashing
//
// test('hashes selectors deterministically', t => {
//   const result = StyleSheet.create({
//     root: {
//       color: 'red',
//     },
//   })
//
//   t.is(result.locals.root[0], 'dss_h28rbs-i0tgik')
// })
//
// test('hashes media queries and descendant selectors', t => {
//   const result = StyleSheet.create({
//     root: {
//       '@media (min-width: 30px)': {
//         color: 'red',
//       },
//       ':hover': {
//         color: 'red',
//       },
//     },
//   })
//
//   t.is(result.locals.root[1], 'dss_hcs3go-i0tgik')
// })
