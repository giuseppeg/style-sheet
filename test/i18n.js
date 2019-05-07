import test from 'ava'
import { create as _create } from '../src/factory'
import { i18n } from '../src/data'
import { resolverToString } from './_utils'

const create = opts =>
  _create({
    i18n: {},
    ...opts,
  })

test('creates and resolves i18n styles', t => {
  const { StyleSheet, StyleResolver } = create({
    i18n: {
      isRTL: true,
      doLeftAndRightSwapInRTL: true,
    },
  })

  const result = StyleSheet.create({
    root: {
      marginLeft: 10,
      float: 'right',
      display: 'block',
    },
  })

  t.deepEqual(result, {
    root: [
      'dss_31b1ksw2-7qvd50|dss_3107tc4v-oyp9nw',
      'dss_31a9sfb9-xjidwl|dss_31a9sfb9-52pxm8',
      'dss_3j9ctud-1t7uh5u',
    ],
  })

  const resolved = StyleResolver.resolve(result.root)
  t.is(resolved, 'dss_3j9ctud-1t7uh5u dss_31a9sfb9-52pxm8 dss_3107tc4v-oyp9nw')
  t.snapshot(resolverToString(StyleResolver))
})

test('resolves i18n styles based on the i18n manager values', t => {
  let doLeftAndRightSwapInRTL = true

  const { StyleSheet, StyleResolver } = create({
    i18n: {
      isRTL: true,
      get doLeftAndRightSwapInRTL() {
        return doLeftAndRightSwapInRTL
      },
    },
  })

  const result = StyleSheet.create({
    root: {
      marginLeft: 10,
      float: 'right',
      display: 'block',
    },
  })

  let resolved = StyleResolver.resolve(result.root)
  t.is(resolved, 'dss_3j9ctud-1t7uh5u dss_31a9sfb9-52pxm8 dss_3107tc4v-oyp9nw')

  doLeftAndRightSwapInRTL = false
  resolved = StyleResolver.resolve(result.root)
  t.is(resolved, 'dss_3j9ctud-1t7uh5u dss_31a9sfb9-xjidwl dss_31b1ksw2-7qvd50')
})

test('resolves multiple rules', t => {
  let doLeftAndRightSwapInRTL = true

  const { StyleSheet, StyleResolver } = create({
    i18n: {
      isRTL: true,
      get doLeftAndRightSwapInRTL() {
        return doLeftAndRightSwapInRTL
      },
    },
  })

  const one = StyleSheet.create({
    root: {
      borderTopLeftRadius: 0,
      left: 0,
    },
  }).root

  const two = StyleSheet.create({
    root: {
      borderTopLeftRadius: 10,
      left: 10,
    },
  }).root

  let resolved = StyleResolver.resolve([one, two])
  t.is(resolved, 'dss_31idvwo2-oyp9nw dss_3xjidwl-oyp9nw')
  t.snapshot(resolverToString(StyleResolver))

  doLeftAndRightSwapInRTL = false
  resolved = StyleResolver.resolve([one, two])
  t.is(resolved, 'dss_31qlnxpd-7qvd50 dss_352pxm8-7qvd50')
  t.snapshot(resolverToString(StyleResolver))
})

test('flips properties', t => {
  const { StyleSheet, StyleResolver } = create({
    i18n: {
      isRTL: true,
      doLeftAndRightSwapInRTL: true,
    },
  })

  const styles = StyleSheet.create({
    root: Object.keys(i18n.properties).reduce((styles, prop) => {
      styles[prop] = 'test'
      return styles
    }, {}),
  })

  const resolved = StyleResolver.resolve(styles.root)
  t.snapshot(resolved)
  t.snapshot(resolverToString(StyleResolver))
})

test('flips values', t => {
  const { StyleSheet, StyleResolver } = create({
    i18n: {
      isRTL: true,
      doLeftAndRightSwapInRTL: true,
    },
  })

  const styles = StyleSheet.create({
    root: Object.keys(i18n.values).reduce((styles, value, index) => {
      styles[`test${index}`] = value
      return styles
    }, {}),
  })

  const resolved = StyleResolver.resolve(styles.root)
  t.snapshot(resolved)
  t.snapshot(resolverToString(StyleResolver))
})
