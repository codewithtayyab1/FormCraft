const router = require('express').Router()
const { getPublicForm, submitResponse } = require('../controllers/publicController')

// No auth middleware — fully public
router.get('/forms/:shareId',          getPublicForm)
router.post('/forms/:shareId/submit',  submitResponse)

module.exports = router
