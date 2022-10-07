var mysql = require('mysql')

var connection = mysql.createConnection({
  host: process.env.DB_URI,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
})

connection.connect(function (err) {
  if (err) throw err
  console.log('Connected!')
})

module.exports = connection
