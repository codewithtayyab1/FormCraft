const Form     = require('../models/Form')
const Response = require('../models/Response')

// Returns the form only if it exists and belongs to req.user; otherwise sends the error response.
const requireOwner = async (id, userId, res) => {
  const form = await Form.findById(id)
  if (!form) { res.status(404).json({ error: 'Form not found' }); return null }
  if (form.owner.toString() !== userId.toString()) {
    res.status(403).json({ error: 'Not authorized' }); return null
  }
  return form
}

exports.create = async (req, res) => {
  try {
    const { title, description, fields } = req.body ?? {}
    const form = await Form.create({
      owner: req.user._id,
      ...(title       != null && { title }),
      ...(description != null && { description }),
      ...(Array.isArray(fields) && fields.length && { fields }),
    })
    res.status(201).json(form)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create form' })
  }
}

exports.list = async (req, res) => {
  try {
    const forms = await Form.find({ owner: req.user._id })
      .select('title description fields isPublished shareId createdAt updatedAt')
      .sort({ updatedAt: -1 })

    // Batch-count responses for all forms in one query
    const ids = forms.map(f => f._id)
    const counts = await Response.aggregate([
      { $match: { form: { $in: ids } } },
      { $group: { _id: '$form', n: { $sum: 1 } } },
    ])
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.n]))

    res.json(forms.map(f => ({
      _id:           f._id,
      title:         f.title,
      description:   f.description,
      fieldCount:    f.fields.length,
      responseCount: countMap[f._id.toString()] ?? 0,
      isPublished:   f.isPublished,
      shareId:       f.shareId,
      updatedAt:     f.updatedAt,
      createdAt:     f.createdAt,
    })))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch forms' })
  }
}

exports.getOne = async (req, res) => {
  try {
    const form = await requireOwner(req.params.id, req.user._id, res)
    if (!form) return
    res.json(form)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch form' })
  }
}

exports.update = async (req, res) => {
  try {
    const form = await requireOwner(req.params.id, req.user._id, res)
    if (!form) return

    const { title, description, fields, isPublished } = req.body
    if (title       !== undefined) form.title       = title
    if (description !== undefined) form.description = description
    if (fields      !== undefined) form.fields      = fields
    if (isPublished !== undefined) form.isPublished = isPublished

    await form.save()
    res.json(form)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update form' })
  }
}

exports.remove = async (req, res) => {
  try {
    const form = await requireOwner(req.params.id, req.user._id, res)
    if (!form) return
    await form.deleteOne()
    res.json({ message: 'Form deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete form' })
  }
}
