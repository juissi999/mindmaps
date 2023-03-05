var express = require('express')
var app = express()

const PORT = 80

app.use(express.static('docs'))

app.listen(PORT)