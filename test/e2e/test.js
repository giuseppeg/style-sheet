require('./_setup')

test('page title', async t => {
  t.true((await page.title()).includes('test'))
})
