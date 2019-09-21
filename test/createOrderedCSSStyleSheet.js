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

test('inserts at the end of the group when no index is provided', t => {
  const sheet = create()
  sheet.insertRule('.test1 { color: red }', 2)
  sheet.insertRule('.test2 { color: green }', 2)
  t.snapshot(sheet.getTextContent())
})

test('inserts at a specific index in the group', t => {
  const sheet = create()
  sheet.insertRule('.group3 { color: orange }', 3)
  sheet.insertRule('.group4 { display: block }', 4)
  sheet.insertRule('.test1 { color: red }', 2)
  sheet.insertRule('.test2 { color: green }', 2)
  sheet.insertRule('.test3 { color: yellow }', 2, 1)
  sheet.insertRule('.test4 { color: hotpink }', 2, 1)
  sheet.insertRule('.nextGroupStillWorks { color: papaya }', 3)
  t.snapshot(sheet.getTextContent())
})

test('throws when the index is out of bound', t => {
  const sheet = create()
  t.throws(() => {
    sheet.insertRule('.test1 { color: red }', 2, 1)
  })
})

test('not throws when the index is valid', t => {
  const sheet = create()
  t.notThrows(() => {
    sheet.insertRule('.test1 { color: red }', 2, 0)
  })
  t.snapshot(sheet.getTextContent())
})
