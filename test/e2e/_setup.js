require('regenerator-runtime/runtime')
const test = require('ava')
const puppeteer = require('puppeteer')

global.test = test

test.before(async () => {
  global.browser = await puppeteer.launch()
  global.page = await browser.newPage()
})

test.after.always(async () => {
  await page.close()
  await browser.close()
})
