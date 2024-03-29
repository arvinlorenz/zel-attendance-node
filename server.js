require('dotenv').config()
var express = require('express')
const userRoutes = require('./routes/users')
const departmentRoutes = require('./routes/departments')
const attendanceRoutes = require('./routes/attendance')
const announcementRoutes = require('./routes/announcements')
const pagesRoutes = require('./routes/pages')
const app = express()
const https = require('https')
const fs = require('fs')
const path = require('path')

const privateKey = fs.readFileSync('zel-zams_com.key')
const certificate = fs.readFileSync('zel-zams_com_integrated.crt')

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
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
app.use('/api/attendance', attendanceRoutes)
app.use('/api/announcements', announcementRoutes)
app.use(pagesRoutes)
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
})

var server = https
  .createServer(
    {
      key: privateKey,
      cert: certificate,
    },
    app
  )
  .listen(process.env.PORT || 8443)
server.on('error', function (e) {
  // Handle your error here
  console.log(e)
})

// app.listen(3000)
