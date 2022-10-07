module.exports = (req, res, next) => {
  if (req.userData.role === 'admin') {
    next()
  } else {
    res.status(401).json({ message: 'Not Authorized' })
  }
}
