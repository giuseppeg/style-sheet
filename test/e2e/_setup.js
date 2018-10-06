require('regenerator-runtime/runtime')
const test = require('ava')
const puppeteer = require('puppeteer')

global.test = test
global.debug = false

test.before(async () => {
  global.browser = await puppeteer.launch({ headless: !global.debug })
  global.page = await browser.newPage()
  global.gotoPage = async fileName => {
    await page.goto('http://localhost:5000/' + fileName, { waitUntil: 'load' })
    await page.addScriptTag({ url: 'http://localhost:5000/_helpers.js' })
    await page.addScriptTag({
      url: 'http://localhost:5000/dist/_styleSheet.js',
    })
  }
})

test.after.always(async () => {
  await page.close()
  await browser.close()
})
