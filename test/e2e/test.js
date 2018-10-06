require('./_setup')

test('minimal testcase', async t => {
  await gotoPage('test.html')

  const color = await page.evaluate(() => {
    const { StyleSheet, StyleResolver } = styleSheet.create()
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
})

test('reconciles style tags when resolving new rules', async t => {
  await gotoPage('test.html')

  const css = await page.evaluate(() => {
    const sheets = styleSheet.createSheets()
    sheets.sheet.ownerNode.textContent = '.dss_h28rbs-i0tgik {color:red}'

    const { StyleSheet, StyleResolver } = styleSheet.create(sheets)
    const styles = StyleSheet.create({
      test1: {
        color: 'red',
      },
      test2: {
        color: 'green',
      },
    })
    StyleResolver.resolve([styles.test1, styles.test2])
    return cssRulesToString(sheets.sheet.cssRules)
  })

  t.is(
    css,
    '.dss_h28rbs-b5mm4 { color: green; }.dss_h28rbs-i0tgik { color: red; }'
  )
})

test('when reconciling does not add new rules if they exist', async t => {
  await gotoPage('test.html')

  const css = await page.evaluate(() => {
    const sheets = styleSheet.createSheets()
    sheets.sheet.ownerNode.textContent = '.dss_h28rbs-i0tgik {color:red}'

    const { StyleSheet, StyleResolver } = styleSheet.create(sheets)
    const styles = StyleSheet.create({
      test1: {
        color: 'red',
      },
      test2: {
        color: 'green',
      },
    })
    StyleResolver.resolve([styles.test2, styles.test1])
    return cssRulesToString(sheets.sheet.cssRules)
  })

  t.is(css, '.dss_h28rbs-i0tgik { color: red; }')
})

test('reconciles link tags i.e. inserts only new rules', async t => {
  await gotoPage('test.html')
  await page.addStyleTag({ url: '/fixtures/external.css' })

  const css = await page.evaluate(() => {
    const sheets = styleSheet.createSheets()
    sheets.linkSheet = document.querySelector('link').sheet

    const { StyleSheet, StyleResolver } = styleSheet.create(sheets)
    const styles = StyleSheet.create({
      test1: {
        color: 'red',
      },
      test2: {
        color: 'green',
      },
    })
    StyleResolver.resolve([styles.test1, styles.test2])
    return cssRulesToString(sheets.sheet.cssRules)
  })

  t.is(css, '.dss_h28rbs-b5mm4 { color: green; }')
})
