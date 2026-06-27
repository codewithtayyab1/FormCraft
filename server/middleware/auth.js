const jwt = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async (req, res, next) => {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' })

  const token = header.split(' ')[1]

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(id).select('-password')
    if (!req.user)
      return res.status(401).json({ error: 'User not found' })
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
