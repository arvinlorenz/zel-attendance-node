var mysql = require('mysql')

var connection = mysql.createConnection({
  host: 'zel-zam.cqhxplikdrze.ap-southeast-1.rds.amazonaws.com',
  user: 'zeladmin',
  password: 'Password_1234',
})

connection.connect(function (err) {
  if (err) throw err
  console.log('Connected!')
})

module.exports = connection
