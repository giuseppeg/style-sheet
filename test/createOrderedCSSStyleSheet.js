import test from 'ava'
import create from '../src/createOrderedCSSStyleSheet'

test('creates a sheet', t => {
  const sheet = create()
  t.truthy(sheet.insertRule)
  t.is(sheet.getTextContent(), '')
})

test('inserts rules', t => {
  const sheet = create()
  sheet.insertRule('.test { color: red }', 0)
  t.snapshot(sheet.getTextContent())
})

test('does not insert duplicates', t => {
  const sheet = create()
  sheet.insertRule('.test { color: red }', 0)
  sheet.insertRule('.test { color: red }', 0)
  sheet.insertRule('.test1 { color: green }', 0)
  t.snapshot(sheet.getTextContent())
})

test('insert @media queries', t => {
  const sheet = create()
  sheet.insertRule('@media (min-width: 300px) { .test1 { color: red } }', 0)
  sheet.insertRule(
    '@media (min-width: 300px) { .test1:hover { color: red } }',
    0
  )
  sheet.insertRule(
    '@media (min-width: 300px) { .test1 > :hover { color: red } }',
    0
  )
  t.snapshot(sheet.getTextContent())
})

// test('flush', t => {
//   const sheet = create()
//   const r1 = 'div { color: red }'
//   const r2 = 'div { color: green }'
//   sheet.insertRule(r1)
//   sheet.insertRule(r2)
//   t.is(flush(sheet), r1 + r2)
//   t.deepEqual(sheet.cssRules, { length: 0 })
// })
