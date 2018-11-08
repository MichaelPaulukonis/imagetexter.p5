const appServer = require('../src/server/server')
const express = require('express')
const port = process.env.PORT || 8087

const app = express()

app.use('/', express.static('dist/'))
// app.use(require('./stub-services'))

appServer.attach(app)

return app.listen(port, () => {
  console.log('Server is listening on port ' + port)
})
