var express = require('express')
var router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
var connection = require('../database.js')

router.post('/login', function (req, res, next) {
  var username = req.body.username
  var password = req.body.password

  connection.query(
    'select * from dbrf3.user where username = ?',
    [username],
    (err, result) => {
      if (err) {
        console.log(err)
        res.status(200).json({
          message: 'Auth failed',
        })
      } else {
        if (result.length == 0) {
          res.status(200).json({
            message: 'Auth failed',
          })
        } else {
          var hashedPassword = result[0].password
          var passed = bcrypt.compare(password, hashedPassword)

          if (passed == false) {
            res.status(200).json({
              message: 'Auth failed',
            })
          } else {
            req.session.loggedin = true
            req.session.username = username

            const token = jwt.sign(
              {
                userId: result[0].id,
                username: result[0].username,
              },
              process.env.JWT_KEY,
              { expiresIn: '9999 years' }
            )

            res.status(200).json({
              token,
              userId: result[0].id,
              username: result[0].username,
              isLoggedIn: true,
              userData: result[0],
            })
          }
        }
      }
    }
  )

  //   var username = req.body.username
  //   var password = req.body.password

  //   let result = await bcrypt.compare(req.body.password, user.password)

  //   if (username && password) {
  //     db.query(
  //       'SELECT * FROM user WHERE username = ? AND password = ?',
  //       [username, password],
  //       function (error, results, fields) {
  //         if (results.length > 0) {
  //           req.session.loggedin = true
  //           req.session.username = username
  //           res.status(200).json(results)
  //         } else {
  //           res.send('Incorrect Username and/or Password!')
  //         }
  //         res.end()
  //       }
  //     )
  //   } else {
  //     res.send('Please enter Username and Password!')
  //     res.end()
  //   }
})

router.get('/logout', function (req, res, next) {
  req.session.destroy()

  res.redirect('/')
})

module.exports = router
