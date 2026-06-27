const Form     = require('../models/Form')
const Response = require('../models/Response')

function evalCondition(condition, answerMap) {
  if (!condition?.fieldId) return true
  const src = answerMap[condition.fieldId]
  switch (condition.operator) {
    case 'equals':     return String(src ?? '') === String(condition.value ?? '')
    case 'not_equals': return String(src ?? '') !== String(condition.value ?? '')
    case 'is_one_of':  return Array.isArray(condition.value) && condition.value.includes(src)
    default:           return true
  }
}

exports.getPublicForm = async (req, res) => {
  try {
    const form = await Form.findOne({ shareId: req.params.shareId })
      .select('title description fields isPublished shareId -_id')

    if (!form || !form.isPublished)
      return res.status(404).json({ error: 'Form not found or not accepting responses' })

    // Return only what a respondent needs — no owner, no internal IDs
    res.json({
      title:       form.title,
      description: form.description,
      shareId:     form.shareId,
      fields:      form.fields,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

exports.submitResponse = async (req, res) => {
  try {
    const form = await Form.findOne({ shareId: req.params.shareId })
      .select('_id fields isPublished')

    if (!form || !form.isPublished)
      return res.status(404).json({ error: 'Form not found or not accepting responses' })

    const { answers } = req.body
    if (!Array.isArray(answers))
      return res.status(400).json({ error: 'answers must be an array' })

    // Build answer map for condition evaluation
    const answerMap = Object.fromEntries(answers.map(a => [a.fieldId, a.value]))

    // Validate required fields — skip fields hidden by conditional logic
    for (const field of form.fields) {
      if (!field.required) continue
      if (!evalCondition(field.condition, answerMap)) continue // field was hidden
      const val   = answerMap[field.id]
      const blank = val === undefined || val === null || val === '' ||
                    (Array.isArray(val) && val.length === 0)
      if (blank)
        return res.status(400).json({
          error: `"${field.label || 'A required field'}" is required`,
        })
    }

    // Validate email format
    for (const field of form.fields.filter(f => f.type === 'email')) {
      const val = answers.find(a => a.fieldId === field.id)?.value
      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        return res.status(400).json({
          error: `"${field.label || 'Email'}" must be a valid email address`,
        })
    }

    // Validate numeric ranges for rating / linear_scale / nps
    for (const field of form.fields.filter(f => ['rating','linear_scale','nps'].includes(f.type))) {
      const raw = answers.find(a => a.fieldId === field.id)?.value
      if (raw === undefined || raw === null) continue
      const val = Number(raw)
      const minV = field.type === 'nps' ? 0 : (field.min ?? (field.type === 'rating' ? 1 : 0))
      const maxV = field.type === 'nps' ? 10 : (field.max ?? (field.type === 'rating' ? 5 : 10))
      if (isNaN(val) || val < minV || val > maxV)
        return res.status(400).json({
          error: `"${field.label || 'A field'}" value must be between ${minV} and ${maxV}`,
        })
    }

    await Response.create({ form: form._id, answers })
    res.status(201).json({ message: 'Response recorded. Thank you!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}
