require('dotenv').config()
var express = require('express')
const userRoutes = require('./routes/users')
const departmentRoutes = require('./routes/departments')
const app = express()
const https = require('https')
const fs = require('fs')
const privateKey = fs.readFileSync('zel-zams_com.key')
const certificate = fs.readFileSync('zel-zams_com_integrated.crt')

app.use(express.json())

app.use((req, res, next) => {
  res.setHeader('X-Auth-Token', '*')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With, Content-Type,Accept,Authorization'
  )
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  )
  next()
})

app.use('/api/users', userRoutes)
app.use('/api/departments', departmentRoutes)

app.listen(process.env.PORT || 8443)
https
  .createServer(
    {
      key: privateKey,
      cert: certificate,
    },
    app
  )
  .listen(port)
