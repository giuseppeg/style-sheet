/* global testBefore testAfter styleSheet */
const test = require('ava')
// eslint-disable-next-line import/no-unassigned-import
require('./_setup')

test('minimal testcase', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context

  await gotoPage('test.html')

  const color = await page.evaluate(() => {
    const { StyleSheet, StyleResolver } = styleSheet
    const styles = StyleSheet.create({
      test: {
        color: 'green',
      },
    })
    const root = document.querySelector('#root')
    root.classList.add(StyleResolver.resolve(styles.test))
    return getComputedStyle(root).getPropertyValue('color')
  })

  t.is(color, 'rgb(0, 128, 0)')

  await testAfter(context)
})
