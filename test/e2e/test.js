require('./_setup')

test('page title', async t => {
  await page.goto('http://localhost:5000/test.html', { waitUntil: 'load' })

  const color = await page.evaluate(() => {
    const root = document.querySelector('#root')
    const { StyleSheet, StyleResolver } = styleSheet.default()
    const styles = StyleSheet.create({
      root: {
        color: 'green',
      },
    })
    root.classList.add(StyleResolver.resolve(styles.root))
    return getComputedStyle(root).getPropertyValue('color')
  })

  t.is(color, 'rgb(0, 128, 0)')
})
