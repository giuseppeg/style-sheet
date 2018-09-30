import test from 'ava'
import create, { flush } from '../src/server'

test('creates a sheet', t => {
  const sheet = create()
  t.truthy(sheet.insertRule)
  t.deepEqual(sheet.cssRules, { length: 0 })
})

test('inserts rules', t => {
  const sheet = create()
  sheet.insertRule('div { color: red }')
  t.deepEqual(sheet.cssRules, {
    0: { cssText: 'div { color: red }' },
    length: 1,
  })
})

test('increases index when inserting rules', t => {
  const sheet = create()
  sheet.insertRule('div { color: red }')
  sheet.insertRule('div { color: green }')
  t.is(sheet.cssRules.length, 2)
})

test('inserts rules at index', t => {
  const sheet = create()
  sheet.insertRule('div { color: red }')
  sheet.insertRule('div { color: green }', 0)
  t.deepEqual(sheet.cssRules, {
    0: { cssText: 'div { color: green }' },
    length: 1,
  })
})

test('flush', t => {
  const sheet = create()
  const r1 = 'div { color: red }'
  const r2 = 'div { color: green }'
  sheet.insertRule(r1)
  sheet.insertRule(r2)
  t.is(flush(sheet), r1 + r2)
  t.deepEqual(sheet.cssRules, { length: 0 })
})
