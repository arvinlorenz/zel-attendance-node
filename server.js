require('dotenv').config()
var express = require('express')
const userRoutes = require('./routes/users')
const departmentRoutes = require('./routes/departments')
const app = express()
var os = require('os')
console.log(os.hostname())

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

// var connection = mysql.createConnection({
//   host: 'zel-zam.cqhxplikdrze.ap-southeast-1.rds.amazonaws.com',
//   user: 'zeladmin',
//   password: 'Password_1234',
// })

// connection.connect(function (err) {
//   if (err) throw err
//   console.log('Connected!')
// })

app.use('/api/users', userRoutes)
app.use('/api/departments', departmentRoutes)

app.listen(process.env.PORT || 3000)
