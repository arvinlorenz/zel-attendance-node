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
              department: d.department,
              section: d.section,
              yearLevel: d.year_level,
              user_type: d.user_type,
            }
          }),
        })
      }
    }
  })
})

router.post('/getRecipients', function (req, res, next) {
  var isForStudent = req.body.isForStudent
  var departments = req.body.departments.toString()

  if (isForStudent) {
    var filteredLevelsAndSections = req.body.filteredLevelsAndSections
    console.log(filteredLevelsAndSections)
    if (filteredLevelsAndSections) {
      var levelsAndSections = []
      levelsAndSections = filteredLevelsAndSections.reduce((acc, d) => {
        if (acc.length < 1) {
          acc.push({
            level: d.split('|')[0].trim(),
            sections: [d.split('|')[1].trim()],
          })
          return acc
        }
        if (acc.length > 0) {
          for (const key in acc) {
            if (acc[key].level === d.split('|')[0].trim()) {
              // if exisitng level loop to sections
              for (const key2 in acc[key].sections) {
                if (acc[key].sections[key2] === d.split('|')[1].trim()) {
                  // if exisitng section
                  return acc
                }
              }
              // if section not existing
              acc[key].sections.push(d.split('|')[1].trim())
              return acc
            }
          }
          // if year level not existing
          acc.push({
            level: d.split('|')[0].trim(),
            sections: [d.split('|')[1].trim()],
          })
          return acc
        }
      }, [])
      console.log(levelsAndSections)
      var level = levelsAndSections[0].level
      var sections = levelsAndSections[0].sections.toString()
      console.log(level, sections)
      connection.query(
        'select year_level,section, lrn from dbrf3.students where FIND_IN_SET(year_level, ?) AND FIND_IN_SET(section, ?)',
        [level, sections],
        (err, result) => {
          if (err) {
            console.log(err)
            res.status(400).json({
              message: 'failed',
            })
          }
          console.log(result.map((r) => r.sid))
          res.status(200).json({
            recipients: result.map((r) =>
              r.lrn.trim().replaceAll('-', '').toLowerCase()
            ),
          })
        }
      )
    } else {
      console.log(departments)
      connection.query(
        'select department, lrn from dbrf3.students where FIND_IN_SET(department, ?)',
        [departments],
        (err, result) => {
          if (err) {
            console.log(err)
            res.status(400).json({
              message: 'failed',
            })
          }
          console.log(result.map((r) => r.lrn))
          res.status(200).json({
            recipients: result.map((r) =>
              r.lrn.trim().replaceAll('-', '').toLowerCase()
            ),
          })
        }
      )
    }
  } else {
    connection.query(
      'select department, sid from dbrf3.staffs where FIND_IN_SET(department, ?)',
      [departments],
      (err, result) => {
        if (err) {
          console.log(err)
          res.status(400).json({
            message: 'failed',
          })
        }

        res.status(200).json({
          recipients: result.map((r) =>
            r.sid.trim().replaceAll('-', '').toLowerCase()
          ),
        })
      }
    )
  }
})

module.exports = router
