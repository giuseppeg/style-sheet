const test = require('ava')
const puppeteer = require('puppeteer')

global.test = test
global.debug = false

global.testBefore = async () => {
  const browser = await puppeteer.launch({ headless: !global.debug })
  const page = await browser.newPage()
  const gotoPage = async fileName => {
    await page.goto('http://localhost:5000/' + fileName, { waitUntil: 'load' })
    await page.addScriptTag({ url: 'http://localhost:5000/_helpers.js' })
    await page.addScriptTag({
      url: 'http://localhost:5000/dist/_styleSheet.js',
    })
    await page.addScriptTag({
      url: 'http://localhost:5000/dist/_styleSheetFactory.js',
    })
  }
  return { browser, page, gotoPage }
}

global.testAfter = async context => {
  await context.page.close()
  await context.browser.close()
}
