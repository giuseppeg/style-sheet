require('./_setup')

test('minimal testcase', async t => {
  await gotoPage('test.html')

  const color = await page.evaluate(() => {
    const { StyleSheet, StyleResolver } = styleSheet.create()
    const styles = StyleSheet.create({
      root: {
        color: 'green',
      },
    })
    const root = document.querySelector('#root')
    root.classList.add(StyleResolver.resolve(styles.root))
    return getComputedStyle(root).getPropertyValue('color')
  })

  t.is(color, 'rgb(0, 128, 0)')
})

// TODO Figure out why `sheets.sheet.ownerNode` is `null` after setting its `textContent` here.
test.skip('reconciles style tags', async t => {
  await gotoPage('test.html')

  const styles = await page.evaluate(() => {
    const sheets = styleSheet.createSheets()
    sheets.sheet.ownerNode.textContent = '.dss_h28rbs-i0tgik {color:red}'

    const { StyleSheet, StyleResolver } = styleSheet.create(sheets)
    const styles = StyleSheet.create({
      root: {
        color: 'green',
      },
    })
    StyleResolver.resolve(styles.root)
    return cssRulesToString(sheets.sheet.cssRules)
  })

  t.snapshot(styles)
})
