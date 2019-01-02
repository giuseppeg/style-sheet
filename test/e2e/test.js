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

test('reconciles i18n values', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context

  await gotoPage('test.html', {
    onLoad: async () => {
      await page.evaluate(() => {
        const preRendered = document.createElement('style')
        preRendered.id = '__style_sheet__'
        preRendered.textContent =
          '.dss_1idvwo2-oyp9nw{border-top-right-radius:10px;}.dss_1qlnxpd-7qvd50{border-top-left-radius:10px;}.dss_xjidwl-oyp9nw{right:10px;}.dss_52pxm8-7qvd50{left:10px;}</style>'

        document.head.appendChild(preRendered)
      })
    },
  })

  const values = await page.evaluate(() => {
    const { StyleSheet, StyleResolver, setI18nManager } = styleSheet

    setI18nManager({
      isRTL: true,
      doLeftAndRightSwapInRTL: true,
    })

    const styles = StyleSheet.create({
      test: {
        borderTopLeftRadius: 10,
        left: 10,
      },
    })

    const root = document.querySelector('#root')
    root.className = StyleResolver.resolve(styles.test)

    const computed = getComputedStyle(root)
    return (
      [
        'border-top-left-radius',
        'left',
        'border-top-right-radius',
        'right',
      ].reduce((values, current) => {
        values += `${current}:${computed.getPropertyValue(current)};`
        return values
      }, '{') + '}'
    )
  })

  t.is(
    values,
    '{border-top-left-radius:0px;left:auto;border-top-right-radius:10px;right:10px;}'
  )

  await testAfter(context)
})

test('inserts only the resolved rules', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context

  await gotoPage('test.html')

  const styles = await page.evaluate(() => {
    const { StyleSheet, StyleResolver, setI18nManager } = styleSheet

    setI18nManager({
      isRTL: true,
      doLeftAndRightSwapInRTL: true,
    })

    const styles = StyleSheet.create({
      test: {
        left: 10,
      },
    })

    StyleResolver.resolve(styles.test)
    const resolved = []
    resolved.push(
      [].map
        .call(
          StyleResolver.getStyleSheet().sheet.cssRules,
          rule => rule.cssText
        )
        .join('')
    )

    setI18nManager({
      isRTL: false,
      doLeftAndRightSwapInRTL: false,
    })
    StyleResolver.resolve(styles.test)
    resolved.push(
      [].map
        .call(
          StyleResolver.getStyleSheet().sheet.cssRules,
          rule => rule.cssText
        )
        .join('')
    )
    return resolved
  })

  t.deepEqual(styles, [
    '.dss_xjidwl-oyp9nw { right: 10px; }',
    '.dss_52pxm8-7qvd50 { left: 10px; }.dss_xjidwl-oyp9nw { right: 10px; }',
  ])

  await testAfter(context)
})
