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

test('inserts groups in order', t => {
  const sheet = create()
  sheet.insertRule('.test1 { color: red }', 2)
  sheet.insertRule('.test2 { color: red }', 2.5)
  sheet.insertRule('.test3 { color: green }', 10)
  sheet.insertRule('.test4 { color: green }', 20)
  sheet.insertRule('.test5 { color: green }', 20.5)

  t.snapshot(sheet.getTextContent())
})
