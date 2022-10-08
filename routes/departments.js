var express = require('express')
var router = express.Router()

var connection = require('../database.js')
const checkAuth = require('../middleware/check-auth')
router.get('/', function (req, res, next) {
  connection.query('select * from dbrf3.departments', [], (err, result) => {
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
          data: result.map((d) => {
            return {
              id: d.id,
              description: d.description,
              user_type: d.user_type,
            }
          }),
        })
      }
    }
  })
})

router.post('/getRecipients', function (req, res, next) {
  var departments = req.body.departments.toString()
  console.log(departments)
  connection.query(
    'select department, username from dbrf3.user where FIND_IN_SET(department, ?)',
    [departments],
    (err, result) => {
      if (err) {
        console.log(err)
        res.status(400).json({
          message: 'failed',
        })
      }
      console.log(result.map((r) => r.username))
      res.status(200).json({
        recipients: result.map((r) => r.username),
      })
    }
  )
})

module.exports = router
