/* global global:readonly */
const puppeteer = require('puppeteer')

global.debug = false

global.testBefore = async () => {
  const browser = await puppeteer.launch({ headless: !global.debug })
  const page = await browser.newPage()
  const gotoPage = async (fileName, { onLoad } = {}) => {
    await page.goto('http://localhost:5000/' + fileName, { waitUntil: 'load' })
    if (onLoad) {
      await onLoad()
    }
    await page.addScriptTag({
      url: 'http://localhost:5000/lib/_styleSheet.js',
    })
    await page.addScriptTag({
      url: 'http://localhost:5000/lib/_styleSheetFactory.js',
    })
  }
  return { browser, page, gotoPage }
}

global.testAfter = async context => {
  await context.page.close()
  await context.browser.close()
}
