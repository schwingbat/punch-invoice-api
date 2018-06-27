const router = require('express').Router()

router.use('/generate', require('./generate'))

module.exports = router