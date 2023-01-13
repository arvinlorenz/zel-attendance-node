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

router.post('/', function (req, res, next) {
  var announcementFirebaseKey = req.body.announcementFirebaseKey
  var author = req.body.author
  var date = req.body.date
  var title = req.body.title
  var info = req.body.info
  var recipientGroup = req.body.recipientGroup
  var recipients = req.body.recipients
  var departments = req.body.departments
  var filteredLevelsAndSections = req.body.filteredLevelsAndSections
  mysql_pool.getConnection(function (err, connection) {
    if (err) {
      connection.release()
      console.log(' Error getting mysql_pool connection: ' + err)
      throw err
    }
    connection.query(
      'INSERT INTO dbrf3.announcements (firebaseId, author, date, title,info,recipientGroup,recipients,departments,filteredLevelsAndSections) VALUES (?,?,?,?,?,?,?,?,?)',
      [
        announcementFirebaseKey,
        author,
        date,
        title,
        info,
        recipientGroup,
        recipients,
        departments,
        filteredLevelsAndSections,
      ],

      (err, result) => {
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
              data: result,
            })
          }
        }
      }
    )

    connection.release()
  })
})

router.delete('/', function (req, res, next) {
  var announcementFirebaseKey = req.body.announcementFirebaseKey
  mysql_pool.getConnection(function (err, connection) {
    if (err) {
      connection.release()
      console.log(' Error getting mysql_pool connection: ' + err)
      throw err
    }
    connection.query(
      'DELETE FROM dbrf3.announcements WHERE firebaseId=?',
      [announcementFirebaseKey],

      (err, result) => {
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
              data: result,
            })
          }
        }
      }
    )

    connection.release()
  })
})

router.post('/byAuthorId', function (req, res, next) {
  var author = req.body.author === 'admin' ? '' : req.body.author
  var sql =
    req.body.author === 'admin'
      ? 'select * from dbrf3.announcements'
      : 'select * from dbrf3.announcements where author=?'
  console.log(sql)
  mysql_pool.getConnection(function (err, connection) {
    if (err) {
      connection.release()
      console.log(' Error getting mysql_pool connection: ' + err)
      throw err
    }
    connection.query(sql, [author], (err, result) => {
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
    })

    connection.release()
  })
})
module.exports = router
