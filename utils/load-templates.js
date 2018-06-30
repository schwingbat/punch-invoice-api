/*
  Loads template files in ./assets/{{name}}/*
  Concatenates CSS and passes it to the template as 'styles'
  Compiles the template with data and returns an HTML string
*/

const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')
const templatesPath = path.join(__dirname, '..', 'templates')

function loadTemplate (directory, hot = false) {
  const entry = {
    template: null,
    styles: '',
    render: function (data) {
      return this.template({
        styles: this.styles,
        ...data
      })
    }
  }

  const load = function () {
    const contents = fs.readdirSync(directory)
    contents.forEach(file => {
      if (file[0] !== '_') {
        const ext = path.extname(file).toLowerCase()

        switch (ext) {
        case '.hbs':
          entry.template = handlebars.compile(fs.readFileSync(path.join(directory, file), 'utf8'))
          break;
        case '.css':
          entry.styles += fs.readFileSync(path.join(directory, file), 'utf8')
          break;
        }
      }
    })
  }

  if (hot) {
    entry.render = function (data) {
      load()
      return this.template({
        styles: this.styles,
        ...data
      })
    }
  } else {
    load()
  }

  return entry
}

const hotTemplates = process.argv.includes('--hot-templates')

const objectLabels = {
  generic: loadTemplate(path.join(templatesPath, '_objects', 'generic'), hotTemplates),
  vsts: loadTemplate(path.join(templatesPath, '_objects', 'vsts'), hotTemplates)
}

handlebars.registerHelper('object-label', function (key, value) {
  if (!objectLabels[key]) {
    return objectLabels.generic.render({ key, value })
  } else {
    return objectLabels[key].render({ key, value })
  }
})

module.exports = function () {
  const entries = {}

  fs.readdirSync(templatesPath).forEach(folder => {
    const templatePath = path.join(templatesPath, folder)

    if (folder[0] !== '_' && fs.statSync(templatePath).isDirectory()) {
      entries[folder] = loadTemplate(templatePath, process.argv.includes('--hot-templates'))
    }
  })

  return entries
}