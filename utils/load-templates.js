/*
  Loads template files in ./assets/{{name}}/*
  Concatenates CSS and passes it to the template as 'styles'
  Compiles the template with data and returns an HTML string
*/

const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')
const usb64 = require('urlsafe-base64')
const templatesPath = path.join(__dirname, '..', 'templates')

function makeFontFace (font, templateDir) {
  let out = '@font-face {\n'

  out += `  font-family: "${font.name}";\n`
  if (font.weight) { out += `  font-weight: ${font.weight};\n` }
  if (font.style) { out += `  font-style: ${font.style};\n` }

  out += `  src: `
  const paths = ((font.path) ? [font.path] : font.paths).map(p => path.join(templateDir, p))
  paths.forEach((fontPath, i) => {
    const format = path.extname(fontPath).toLowerCase().slice(1)
    const encoded = `data:application/x-font-${format};charset=utf-8;base64,${fs.readFileSync(fontPath).toString('base64')}`
    out += `url("${encoded}") format("${format}")`
    if (i + 1 < paths.length) {
      out += ',\n       '
    } else {
      out += ';\n'
    }
  })
  
  out += '}\n'

  return out
}

function loadTemplate (directory, hot = false) {
  const entry = {
    template: null,
    styles: '',
    scripts: '',
    resources: directory,
    render: function (data) {
      return this.template({
        styles: this.styles,
        ...data
      })
    }
  }

  const load = function () {
    const manifest = require(path.join(directory, 'template.json'))

    if (manifest.fonts) {
      manifest.fonts.forEach(font => {
        entry.styles += makeFontFace(font, directory)
      })
    }

    if (manifest.css) {
      manifest.css.forEach(file => {
        entry.styles += fs.readFileSync(path.join(directory, file), 'utf8')
      })
    }

    if (manifest.js) {
      manifest.js.forEach(file => {
        entry.scripts += '<script>\n'
        entry.scripts += fs.readFileSync(path.join(directory, file), 'utf8')
        entry.scripts += '</script>\n'
      })
    }

    entry.template = handlebars.compile(fs.readFileSync(path.join(directory, manifest.template), 'utf8'))
  }

  if (hot) {
    entry.render = function (data, opts = {}) {
      this.styles = ''
      this.scripts = ''
      load()
      const rendered = this.template({
        styles: this.styles,
        scripts: this.scripts,
        ...data
      })
      if (opts.debug) {
        fs.writeFileSync(path.join(__dirname, '../temp/debug.css'), this.styles)
        fs.writeFileSync(path.join(__dirname, '../temp/debug.html'), rendered)
      }
      return rendered
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

handlebars.registerHelper('object-label', function (key, value, config = {}) {
  if (!objectLabels[key]) {
    return objectLabels.generic.render({ key, value, config })
  } else {
    return objectLabels[key].render({ key, value, config })
  }
})

handlebars.registerHelper('json', function (object, pretty = false) {
  return JSON.stringify(object, null, pretty ? 2 : null)
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