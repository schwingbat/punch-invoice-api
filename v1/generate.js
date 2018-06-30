const router = require('express').Router()
const templates = require('../utils/load-templates')()
const puppeteer = require('puppeteer')

router.post('/pdf/:template', async (req, res) => {
  const template = req.params.template.toLowerCase()

  if (!templates[template]) {
    return res.status(400).json({
      error: `${template} is not a supported template`
    })
  }

  const html = templates[template].render(req.body)
  puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    .then(async browser => {
      const page = await browser.newPage()
      page.once('load', async () => {
        setTimeout(async () => {
          const buffer = await page.pdf({
            format: 'A4',
            margin: {
              top: '0.5in',
              right: '0.5in',
              bottom: '0.5in',
              left: '0.5in'
            },
            displayHeaderFooter: true,
            headerTemplate: `
              <header>
                <span class="pageNumber"></span> of <span class="totalPages"></span>
              </header>
            `,
            footerTemplate: `
              <footer>
                <span class="pageNumber"></span> of <span class="totalPages"></span>
              </footer>
            `,
          })
          res.send(buffer)
          await page.close()
        }, 300)
      })
      await page.setContent(html)
    })
    .catch(err => {
      console.error(err)
    })
})

module.exports = router