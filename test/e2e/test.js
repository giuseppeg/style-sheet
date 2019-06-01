/* global testBefore:readonly testAfter:readonly styleSheet:readonly getComputedStyle:readonly  */
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
        preRendered.textContent = `
          [style-sheet-group="10"]{}
          .dss10_1idvwo2-oyp9nw{border-top-right-radius:10px;}
          .dss10_1qlnxpd-7qvd50{border-top-left-radius:10px;}
          .dss10_xjidwl-oyp9nw{right:10px;}
          .dss10_52pxm8-7qvd50{left:10px;}
        `
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

test('inserts only the resolved i18n rules', async t => {
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
    resolved.push(StyleResolver.getStyleSheet().getTextContent())

    setI18nManager({
      isRTL: false,
      doLeftAndRightSwapInRTL: false,
    })
    StyleResolver.resolve(styles.test)
    resolved.push(StyleResolver.getStyleSheet().getTextContent())
    return resolved
  })

  t.deepEqual(styles, [
    '[style-sheet-group="10"]{}\n.dss10_xjidwl-oyp9nw{right:10px;}',
    '[style-sheet-group="10"]{}\n.dss10_xjidwl-oyp9nw{right:10px;}\n.dss10_52pxm8-7qvd50{left:10px;}',
  ])

  await testAfter(context)
})

test('resolves shorthand properties', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context

  await gotoPage('test.html')

  const margins = await page.evaluate(() => {
    const { StyleSheet, StyleResolver } = styleSheet

    const styles = StyleSheet.create({
      test: {
        margin: 10,
        marginTop: 20,
        '@media (min-width: 0px)': {
          marginLeft: 30,
        },
      },
    })
    const root = document.querySelector('#root')
    root.className = StyleResolver.resolve(styles.test)
    const computed = getComputedStyle(root)

    return [
      computed.getPropertyValue('margin'),
      computed.getPropertyValue('margin-top'),
    ].join(', ')
  })

  t.is(margins, '20px 10px 10px 30px, 20px')

  await testAfter(context)
})

test('reconciles shorthand properties', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context

  const preRenderedStyles = `[style-sheet-group="2"] { }
.dss2_1nrzrej-7qvd50 { margin: 10px; }
[style-sheet-group="10"] { }
.dss10_1buiceq-13dvipr { margin-top: 20px; }`

  await gotoPage('test.html', {
    onLoad: async () => {
      await page.evaluate(
        preRenderedStyles => {
          const preRendered = document.createElement('style')
          preRendered.id = '__style_sheet__'
          preRendered.textContent = preRenderedStyles
          document.head.appendChild(preRendered)
        },
        [preRenderedStyles]
      )
    },
  })

  const before = await page.evaluate(() => {
    const { StyleResolver } = styleSheet
    return StyleResolver.getStyleSheet().getTextContent()
  })

  t.is(before, preRenderedStyles)

  const after = await page.evaluate(() => {
    const { StyleSheet, StyleResolver } = styleSheet

    const styles = StyleSheet.create({
      test: {
        margin: 10,
        marginTop: 20,
        '@media (max-width: 200px)': {
          marginLeft: 30,
        },
      },
    })

    StyleResolver.resolve(styles.test)
    return StyleResolver.getStyleSheet().getTextContent()
  })

  const beforeWithMedia =
    before +
    `
[style-sheet-group="11"]{}
@media (max-width: 200px){.dss11_zi3on2-11pur1y{margin-left:30px;}}`
  t.is(beforeWithMedia, after)

  await testAfter(context)
})

test('combinator selectors are more specific than states', async t => {
  const context = await testBefore()
  const { gotoPage, page } = context

  await gotoPage('test.html')

  await page.evaluate(() => {
    const { StyleSheet, StyleResolver } = styleSheet

    const styles = StyleSheet.create({
      test: {
        height: 10,
        color: 'blue',
        '&:hover': {
          color: 'red',
          margin: 10,
        },
      },
      another: {
        ':hover > &': {
          color: 'green',
          margin: 20,
          marginTop: 30,
        },
      },
    })

    // Assume sometime ago this was already resolved and injected.
    StyleResolver.resolve(styles.another)

    const root = document.querySelector('#root')
    root.className = StyleResolver.resolve([styles.test, styles.another])
  })

  await page.hover('body')

  const result = await page.evaluate(() => {
    const root = document.querySelector('#root')
    const computedStyle = getComputedStyle(root)
    return [
      computedStyle.getPropertyValue('color'),
      computedStyle.getPropertyValue('margin'),
    ].join(',')
  })

  t.is(result, 'rgb(0, 128, 0),30px 20px 20px')

  await testAfter(context)
})
