var express = require('express')
var router = express.Router()
var mysql = require('mysql')

var admin = require('firebase-admin')

var serviceAccount = require('../serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    'https://zel-attendance-default-rtdb.asia-southeast1.firebasedatabase.app',
})

// Retrieve services via the defaultApp variable...

var mysql_pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_URI,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: 'dbrf3',
})
// var connection = require('../database.js')
const checkAuth = require('../middleware/check-auth')

router.post('/tapsByCardNumber', function (req, res, next) {
  var cardNumber = req.body.cardNumber
  mysql_pool.getConnection(function (err, connection) {
    if (err) {
      connection.release()
      console.log(' Error getting mysql_pool connection: ' + err)
      throw err
    }
    connection.query(
      'select * from dbrf3.taps where card_number=?',
      [cardNumber],
      (err, result) => {
        if (err) {
          console.log(err)
          res.status(400).json({
            message: 'failed',
          })
        } else {
          res.status(200).json({
            data: result,
          })
        }
      }
    )

    connection.release()
  })
})

router.get('/tap', function (req, res, next) {
  console.log('HOORAY', req.query)

  var recipients = [req.query.recipients]
  var username = req.query.recipients.toLowerCase()
  var tapId = Number(req.query.tapId)
  var datetime = Number(req.query.datetime)
  var status = req.query.status
  var timePeriod = req.query.timePeriod
  var title = req.query.title || 'Attendance'
  var body = req.query.body
  var obj = {
    tapId,
    username,
    recipients,
    datetime,
    status,
    timePeriod,
    title,
    body,
  }

  admin
    .database()
    .ref('attendance')
    .push(obj, function (error) {
      if (error) {
        // The write failed...
        console.log('Failed with error: ' + error)
        res.status(400).json({
          message: error,
        })
      } else {
        // The write was successful...
        console.log('success')
        res.status(200).json({
          message: 'attendance was successfully created',
        })
      }
    })

  // database.ref('attendance').set(obj, function (error) {
  //   if (error) {
  //     // The write failed...
  //     console.log('Failed with error: ' + error)
  //     res.status(400).json({
  //       message: error,
  //     })
  //   } else {
  //     // The write was successful...
  //     console.log('success')
  //     res.status(200).json({
  //       message: 'attendance was successfully created',
  //     })
  //   }
  // })
})

// recipients: ['lrnNumber']
// datetime: 1670245730491
// title: 'Attendance'
// status: 'LOG IN' | 'LOG OUT'
// timePeriod: 'Morning' | 'Afternoon'

module.exports = router
