const router = require('express').Router()
const protect = require('../middleware/auth')
const { create, list, getOne, update, remove } = require('../controllers/formController')
const { getResponses, getSummary, deleteResponse } = require('../controllers/responseController')

router.use(protect)

router.post('/',    create)
router.get('/',     list)
router.get('/:id',  getOne)
router.put('/:id',  update)
router.delete('/:id', remove)

// Response sub-routes — summary BEFORE :responseId to avoid param capture
router.get('/:id/responses/summary',        getSummary)
router.get('/:id/responses',                getResponses)
router.delete('/:id/responses/:responseId', deleteResponse)

module.exports = router
