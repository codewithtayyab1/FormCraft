const mongoose = require('mongoose')

const responseSchema = new mongoose.Schema({
  form: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  answers: [{
    fieldId: { type: String, required: true },
    value:   { type: mongoose.Schema.Types.Mixed },
    _id:     false,
  }],
}, { timestamps: true })

module.exports = mongoose.model('Response', responseSchema)
