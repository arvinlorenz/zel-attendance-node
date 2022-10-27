const https = require('https')
const fs = require('fs')
const https_options = {
  //   ca: fs.readFileSync('ca_bundle.crt'),
  key: fs.readFileSync('zel-zams_com.key'),
  cert: fs.readFileSync('zel-zams_com_integrated.crt'),
}
https
  .createServer(https_options, function (req, res) {
    res.writeHead(200)
    res.end('Welcome to Node.js HTTPS Server')
  })
  .listen(8443)
