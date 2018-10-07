require('./_setup')

test('minimal testcase', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context

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

  await testAfter(context)
})

test('resolves deterministically', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context
  await gotoPage('test.html')

  const results = await page.evaluate(() => {
    const { StyleSheet, StyleResolver } = styleSheet.create()
    const test1 = StyleSheet.create({
      test: {
        color: 'red',
      },
    }).test
    const test2 = StyleSheet.create({
      test2: {
        color: 'green',
      },
    }).test2

    const root = document.querySelector('#root')
    // Should resolve to test2.color (green)
    root.className = StyleResolver.resolve([test1, test2])
    const result = {
      green: getComputedStyle(root).getPropertyValue('color'),
    }
    // Should resolve to test1.color (red)
    root.className = StyleResolver.resolve([test2, test1])
    result.red = getComputedStyle(root).getPropertyValue('color')
    return JSON.stringify(result)
  })

  t.is(results, '{"green":"rgb(0, 128, 0)","red":"rgb(255, 0, 0)"}')

  await testAfter(context)
})

test('reconciles style tags when resolving new rules', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context
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

  await testAfter(context)
})

test('when reconciling does not add new rules if they exist', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context
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

  await testAfter(context)
})

test('can use any style tag in the page', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context
  await gotoPage('test.html')

  const results = await page.evaluate(() => {
    const style = document.createElement('style')
    const mediaStyle = document.createElement('style')
    style.textContent = '.dss_h28rbs-i0tgik {color:red}'
    document.head.appendChild(style)
    document.head.appendChild(mediaStyle)

    const sheets = {
      sheet: style.sheet,
      mediaSheet: mediaStyle.sheet,
    }

    const { StyleSheet, StyleResolver } = styleSheet.create(sheets)
    const styles = StyleSheet.create({
      test: {
        color: 'green',
      },
    })

    const root = document.querySelector('#root')
    // Should resolve to test2.color (green)
    root.className = StyleResolver.resolve(['dss_h28rbs-i0tgik', styles.test])
    const result = {
      green: getComputedStyle(root).getPropertyValue('color'),
    }
    // Should resolve to test1.color (red)
    root.className = StyleResolver.resolve([styles.test, 'dss_h28rbs-i0tgik'])
    result.red = getComputedStyle(root).getPropertyValue('color')
    return JSON.stringify(result)
  })

  t.is(results, '{"green":"rgb(0, 128, 0)","red":"rgb(255, 0, 0)"}')

  await testAfter(context)
})

test('reconciles link tags i.e. inserts only new rules', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context
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

  await testAfter(context)
})

test('moves link tag to be in between the style tags', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context

  await gotoPage('test.html')
  await page.addStyleTag({ url: '/fixtures/external.css' })

  const html = await page.evaluate(() => {
    const sheets = styleSheet.createSheets()
    sheets.linkSheet = document.querySelector('link').sheet
    const { StyleSheet, StyleResolver } = styleSheet.create(sheets)

    return Array.prototype.map
      .call(document.querySelectorAll('style, link'), element => {
        return element.tagName
      })
      .join('|')
  })

  t.is(html, 'STYLE|LINK|STYLE')

  await testAfter(context)
})
