var mysql = require('mysql')

var connection = mysql.createConnection({
  host: process.env.DB_URI,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
})

connection.connect(function (err) {
  if (err) throw err
  console.log('Connected!')
  console.log('Running in Port', process.env.PORT)
})

module.exports = connection
