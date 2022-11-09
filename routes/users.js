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
      console.log(' Error getting mysql_pool connection: ' + err)
      throw err
    }
    connection.query(
      'select * from users where username = ?',
      [username],
      async (err, result) => {
        if (err) {
          console.log(err)
          res.status(201).json({
            message: 'Auth failed 1',
          })
        } else {
          if (result.length == 0) {
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
        console.log(' Error getting mysql_pool connection: ' + err)
        throw err
      }
      connection.query(
        'select * from students where replace(lrn, "-", "") = ?',
        [newusername],
        async (err, result) => {
          if (err) {
            console.log(err)
            res.status(201).json({
              message: 'Auth failed',
            })
          } else {
            if (result.length == 0) {
              res.status(400).json({
                message: 'Auth failed',
              })
              // employeeLogin(username, password)
            } else {
              // var hashedPassword = result[0].password
              var passed = false
              if (!result[0].isPasswordChanged) {
                passed =
                  password.trim().toLowerCase() ===
                  result[0].last_name.trim().toLowerCase()
              }
              if (result[0].isPasswordChanged) {
                passed = await bcrypt.compare(password, result[0].password)
              }

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
                    isParent: true,
                    ...result[0],
                  },
                })
              }
            }
          }
        }
      )
    })
  }

  function employeeLogin(username, password) {
    const newusername = username.replaceAll('-', '')

    mysql_pool.getConnection(function (err, connection) {
      if (err) {
        console.log(' Error getting mysql_pool connection: ' + err)
        throw err
      }
      connection.query(
        'select * from staffs where replace(sid, "-", "") = ?',
        [newusername],
        (err, result) => {
          if (err) {
            console.log(err)
            res.status(201).json({
              message: 'Auth failed',
            })
          } else {
            if (result.length == 0) {
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

router.post('/change-password', function (req, res, next) {
  var oldPassword = req.body.oldPassword
  var newPassword = req.body.newPassword
  var username = req.body.username
  var userType = req.body.userType
  console.log(oldPassword, newPassword, username, userType)
  if (userType === 'parent') {
    mysql_pool.getConnection(function (err, connection) {
      if (err) {
        console.log(' Error getting mysql_pool connection: ' + err)
        throw err
      }
      connection.query(
        'select * from students where replace(lrn, "-", "") = ?',
        [username],
        async (err, result) => {
          if (err) {
            console.log(err)
            res.status(404).json({
              message: 'Not Found',
            })
          } else {
            if (result.length == 0) {
              res.status(400).json({
                message: 'Auth failed',
              })
            } else {
              if (!result[0].isPasswordChanged) {
                // if password is never changed
                var passed =
                  oldPassword.trim().toLowerCase() ===
                  result[0].last_name.trim().toLowerCase()
                if (!passed) {
                  res.status(201).json({
                    message: 'You entered an incorrect password',
                  })
                }
                if (passed) {
                  var hashedPassword = await bcrypt.hash(newPassword, 10)
                  connection.query(
                    'UPDATE students SET isPasswordChanged = ?, password = ? where replace(lrn, "-", "") = ?',
                    [1, hashedPassword, username],
                    function (err, result) {
                      if (err) throw err
                    }
                  )

                  res.status(200).json({
                    message: 'Password successfully updated!',
                  })
                }
              }

              if (result[0].isPasswordChanged) {
                var passed = await bcrypt.compare(
                  oldPassword,
                  result[0].password
                )
                console.log(passed)
                if (passed) {
                  var hashedPassword = await bcrypt.hash(newPassword, 10)
                  connection.query(
                    'UPDATE students SET password = ? where replace(lrn, "-", "") = ?',
                    [hashedPassword, username],
                    function (err, result) {
                      if (err) throw err
                    }
                  )

                  res.status(200).json({
                    message: 'Password successfully updated!',
                  })
                } else {
                  res.status(201).json({
                    message: 'You entered an incorrect password',
                  })
                }
              }
            }
          }
        }
      )
      connection.release()
    })
  }

  if (userType === 'admin') {
    mysql_pool.getConnection(function (err, connection) {
      if (err) {
        console.log(' Error getting mysql_pool connection: ' + err)
        throw err
      }
      connection.query(
        'select * from users where username = ?',
        [username],
        async (err, result) => {
          if (err) {
            console.log(err)
            res.status(404).json({
              message: 'Not Found',
            })
          } else {
            if (result.length == 0) {
              res.status(400).json({
                message: 'Auth failed',
              })
            } else {
              var passed = await bcrypt.compare(oldPassword, result[0].password)
              console.log(passed)
              if (passed) {
                var hashedPassword = await bcrypt.hash(newPassword, 10)
                connection.query(
                  'UPDATE users SET password = ? where username = ?',
                  [hashedPassword, username],
                  function (err, result) {
                    if (err) throw err
                  }
                )

                res.status(200).json({
                  message: 'Password successfully updated!',
                })
              } else {
                res.status(201).json({
                  message: 'You entered an incorrect password',
                })
              }
            }
          }
        }
      )
      connection.release()
    })
  }
})
router.get('/logout', function (req, res, next) {
  res.redirect('/')
})

module.exports = router
