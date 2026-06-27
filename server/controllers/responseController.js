const Form     = require('../models/Form')
const Response = require('../models/Response')

const requireOwner = async (formId, userId, res) => {
  const form = await Form.findById(formId)
  if (!form) { res.status(404).json({ error: 'Form not found' }); return null }
  if (form.owner.toString() !== userId.toString()) {
    res.status(403).json({ error: 'Not authorized' }); return null
  }
  return form
}

exports.getResponses = async (req, res) => {
  try {
    const form = await requireOwner(req.params.id, req.user._id, res)
    if (!form) return
    const responses = await Response.find({ form: form._id })
      .select('answers createdAt')
      .sort({ createdAt: -1 })
    res.json(responses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch responses' })
  }
}

exports.getSummary = async (req, res) => {
  try {
    const form = await requireOwner(req.params.id, req.user._id, res)
    if (!form) return

    const allResponses = await Response.find({ form: form._id }).select('answers createdAt')
    const total = allResponses.length

    // Responses by day — last 30 days (include zeros)
    const dayMap = {}
    for (const r of allResponses) {
      const key = r.createdAt.toISOString().slice(0, 10)
      dayMap[key] = (dayMap[key] || 0) + 1
    }
    const byDay = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      byDay.push({ date: key, count: dayMap[key] || 0 })
    }

    // Per-field summaries for choice + rating types
    const fieldSummaries = {}
    for (const field of form.fields) {
      if (['multiple_choice', 'dropdown', 'checkbox'].includes(field.type)) {
        const counts = Object.fromEntries((field.options ?? []).map(o => [o, 0]))
        for (const r of allResponses) {
          const val = r.answers.find(a => a.fieldId === field.id)?.value
          if (Array.isArray(val)) {
            for (const v of val) if (v in counts) counts[v]++
          } else if (val && val in counts) {
            counts[val]++
          }
        }
        fieldSummaries[field.id] = { type: field.type, label: field.label, options: counts }
      } else if (['rating', 'linear_scale', 'nps'].includes(field.type)) {
        const minV = field.type === 'nps' ? 0 : (field.min ?? (field.type === 'rating' ? 1 : 0))
        const maxV = field.type === 'nps' ? 10 : (field.max ?? (field.type === 'rating' ? 5 : 10))

        const vals = allResponses
          .map(r => r.answers.find(a => a.fieldId === field.id)?.value)
          .filter(v => v !== null && v !== undefined)
          .map(Number)
          .filter(v => !isNaN(v) && v >= minV && v <= maxV)

        const avg  = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
        const dist = {}
        for (let i = minV; i <= maxV; i++) dist[i] = 0
        for (const v of vals) dist[v] = (dist[v] || 0) + 1

        const entry = { type: field.type, label: field.label, avg, count: vals.length, distribution: dist, min: minV, max: maxV }

        if (field.type === 'nps' && vals.length > 0) {
          const promoters  = vals.filter(v => v >= 9).length
          const passives   = vals.filter(v => v >= 7 && v <= 8).length
          const detractors = vals.filter(v => v <= 6).length
          entry.npsScore   = Math.round(((promoters - detractors) / vals.length) * 100)
          entry.promoters  = promoters
          entry.passives   = passives
          entry.detractors = detractors
        }

        fieldSummaries[field.id] = entry
      }
    }

    res.json({ total, byDay, fieldSummaries })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate summary' })
  }
}

exports.deleteResponse = async (req, res) => {
  try {
    const form = await requireOwner(req.params.id, req.user._id, res)
    if (!form) return
    await Response.findOneAndDelete({ _id: req.params.responseId, form: form._id })
    res.json({ message: 'Response deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete response' })
  }
}
