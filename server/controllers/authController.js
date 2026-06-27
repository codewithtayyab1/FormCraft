const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// Strip password and internal fields before sending
const sanitize = (user) => ({
  _id:       user._id,
  name:      user.name,
  email:     user.email,
  createdAt: user.createdAt,
})

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email, and password are required' })

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Enter a valid email address' })

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })

    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'An account with that email already exists' })

    const user = await User.create({ name, email, password })
    res.status(201).json({ token: signToken(user._id), user: sanitize(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' })

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid email or password' })

    res.json({ token: signToken(user._id), user: sanitize(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

exports.me = (req, res) => {
  res.json({ user: sanitize(req.user) })
}
