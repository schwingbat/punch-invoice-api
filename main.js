const express = require('express')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 8088

const app = express()

app.use(bodyParser.json())
app.use('/v1', require('./v1'))

app.listen(PORT, () => {
  console.log(`Punch Invoice API running on port ${PORT}`)
  if (process.argv.includes('--hot-templates')) {
    console.log('Templates are HOT')
  }
})