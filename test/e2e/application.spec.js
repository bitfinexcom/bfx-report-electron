const { browser, expect } = require('@wdio/globals')

describe('Electron Testing', () => {
  it('should print application title', async () => {
    expect(await await browser.getTitle()).toBe('Bitfinex Reporting & Performance Tools')
  })
})
