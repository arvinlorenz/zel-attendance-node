var express = require('express')
var router = express.Router()
var mysql = require('mysql')

var mysql_pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_URI,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: 'dbrf3',
})
// var connection = require('../database.js')
const checkAuth = require('../middleware/check-auth')
router.get('/', function (req, res, next) {
  mysql_pool.getConnection(function (err, connection) {
    if (err) {
      connection.release()
      console.log(' Error getting mysql_pool connection: ' + err)
      throw err
    }
    connection.query('select * from dbrf3.taps', [], (err, result) => {
      if (err) {
        console.log(err)
        res.status(400).json({
          message: 'failed',
        })
      } else {
        if (result.length == 0) {
          res.status(400).json({
            message: 'failed',
          })
        } else {
          res.status(200).json({
            data: result.map((a) => {
              return {
                id: a.id,
                date_time: a.date_time,
              }
            }),
          })
        }
      }
    })

    connection.release()
  })
})

module.exports = router
