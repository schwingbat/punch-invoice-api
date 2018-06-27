const router = require('express').Router()
const templates = require('../utils/load-templates')()
const PDF = require('html-pdf')

function generatePDF (data, templateName) {
  return new Promise((resolve, reject) => {
    const html = templates[templateName].render(data)
    const options = {
      format: 'A4',
      zoomFactor: '0.8',
      renderDelay: 500
    }

    PDF.create(html, options).toBuffer((err, buffer) => {
      if (err) {
        reject(err)
      } else {
        resolve(buffer)
      }
    })
  })
}

function generateHTML (data, templateName) {
  return new Promise((resolve, reject) => {
    
  })
}

router.post('/pdf/:template', (req, res) => {
  const template = req.params.template.toLowerCase()

  if (!templates[template]) {
    res.status(400).json({
      error: `${template} is not a supported template`
    })
  }

  generatePDF(req.body, template)
    .then(pdf => {
      res.send(pdf)
    })
})

module.exports = router