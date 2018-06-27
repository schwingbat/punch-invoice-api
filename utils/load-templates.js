/*
  Loads template files in ./assets/{{name}}/*
  Concatenates CSS and passes it to the template as 'styles'
  Compiles the template with data and returns an HTML string
*/

const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')
const templatesPath = path.join(__dirname, '..', 'templates')

module.exports = function () {

  const entries = {}
  const templates = fs.readdirSync(templatesPath)

  templates.forEach(folder => {
    const templatePath = path.join(templatesPath, folder)

    if (folder[0] !== '_' && fs.statSync(templatePath).isDirectory()) {
      const entry = {
        template: null,
        styles: '',
        render: function (data) {
          console.log(data)
          return this.template({
            styles: this.styles,
            ...data
          })
        }
      }

      const contents = fs.readdirSync(templatePath)
      contents.forEach(file => {
        if (file[0] !== '_') {
          const ext = path.extname(file).toLowerCase()

          switch (ext) {
          case '.hbs':
            entry.template = handlebars.compile(fs.readFileSync(path.join(templatePath, file), 'utf8'))
            break;
          case '.css':
            entry.styles += fs.readFileSync(path.join(templatePath, file), 'utf8')
            break;
          }
        }
      })

      entries[folder] = entry
    }
  })

  return entries
}