const router = require('express').Router()
const templates = require('../utils/load-templates')()
const PDF = require('html-pdf')

const formats = ['pdf']

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

router.post('/', (req, res) => {
  let { format, template } = req.query
  format = format.toLowerCase()
  template = template.toLowerCase()

  if (!formats.includes(format)) {
    res.status(400).json({
      error: `${format} is not a supported format`
    })
  }

  if (!templates[template]) {
    res.status(400).json({
      error: `${template} is not a supported template`
    })
  }

  switch (format) {
  case 'pdf':
    generatePDF(req.body, template)
      .then(pdf => {
        res.send(pdf)
      })
    break
  }
})

module.exports = router