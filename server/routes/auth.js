const router = require('express').Router()
const { signup, login, me } = require('../controllers/authController')
const protect = require('../middleware/auth')

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', protect, me)

module.exports = router
