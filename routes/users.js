var express = require('express')
var router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

var mysql = require('mysql')
var mysql_pool = mysql.createPool({
  connectionLimit: 100,
  host: process.env.DB_URI,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: 'dbrf3',
})

router.post('/login', function (req, res, next) {
  var username = req.body.username
  var password = req.body.password

  mysql_pool.getConnection(function (err, connection) {
    if (err) {
      connection.release()
      console.log(' Error getting mysql_pool connection: ' + err)
      throw err
    }
    connection.query(
      'select * from users where username = ?',
      [username],
      async (err, result) => {
        if (err) {
          connection.release()
          console.log(err)
          res.status(201).json({
            message: 'Auth failed 1',
          })
        } else {
          if (result.length == 0) {
            connection.release()
            parentLogin(username, password)
          }

          // if it's admin
          else {
            var hashedPassword = result[0].password
            var passed = await bcrypt.compare(password, hashedPassword)
            console.log(passed)
            if (passed == false) {
              res.status(201).json({
                message: 'Auth failed 2',
              })
            } else {
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
    connection.release()
  })

  function parentLogin(username, password) {
    const newusername = username.replaceAll('-', '')

    mysql_pool.getConnection(function (err, connection) {
      if (err) {
        connection.release()
        console.log(' Error getting mysql_pool connection: ' + err)
        throw err
      }
      connection.query(
        'select * from students where replace(lrn, "-", "") = ?',
        [newusername],
        (err, result) => {
          if (err) {
            connection.release()
            console.log(err)
            res.status(201).json({
              message: 'Auth failed',
            })
          } else {
            if (result.length == 0) {
              connection.release()
              res.status(400).json({
                message: 'Auth failed',
              })
              // employeeLogin(username, password)
            } else {
              // var hashedPassword = result[0].password
              var passed =
                password.trim().toLowerCase() ===
                result[0].last_name.trim().toLowerCase()

              if (passed == false) {
                connection.release()
                res.status(400).json({
                  message: 'Auth failed',
                })
              } else {
                const token = jwt.sign(
                  {
                    userId: result[0].id,
                    username: newusername,
                  },
                  process.env.JWT_KEY,
                  { expiresIn: '9999 years' }
                )

                res.status(200).json({
                  token,
                  userId: result[0].id,
                  username: newusername,
                  isLoggedIn: true,
                  userData: {
                    username: newusername,
                    isParent: true,
                    ...result[0],
                  },
                })
              }
            }
          }
        }
      )
      connection.release()
    })
  }

  function employeeLogin(username, password) {
    const newusername = username.replaceAll('-', '')

    mysql_pool.getConnection(function (err, connection) {
      if (err) {
        connection.release()
        console.log(' Error getting mysql_pool connection: ' + err)
        throw err
      }
      connection.query(
        'select * from staffs where replace(sid, "-", "") = ?',
        [newusername],
        (err, result) => {
          if (err) {
            connection.release()
            console.log(err)
            res.status(201).json({
              message: 'Auth failed',
            })
          } else {
            if (result.length == 0) {
              connection.release()

              res.status(400).json({
                message: 'Auth failed',
              })
            } else {
              // var hashedPassword = result[0].password
              var passed =
                password.trim().toLowerCase() ===
                result[0].last_name.trim().toLowerCase()

              if (passed == false) {
                res.status(400).json({
                  message: 'Auth failed',
                })
              } else {
                const token = jwt.sign(
                  {
                    userId: result[0].id,
                    username: newusername,
                  },
                  process.env.JWT_KEY,
                  { expiresIn: '9999 years' }
                )

                res.status(200).json({
                  token,
                  userId: result[0].id,
                  username: newusername,
                  isLoggedIn: true,
                  userData: {
                    username: newusername,
                    isAdmin: false,
                    ...result[0],
                  },
                })
              }
            }
          }
        }
      )
      connection.release()
    })
  }
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
  res.redirect('/')
})

module.exports = router
