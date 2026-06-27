const mongoose = require('mongoose')
const crypto = require('crypto')

const fieldSchema = new mongoose.Schema({
  id:          { type: String, required: true },
  type:        {
    type: String,
    enum: ['short_text','long_text','multiple_choice','checkbox','dropdown','email','number','rating','linear_scale','nps'],
    required: true,
  },
  label:       { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required:    { type: Boolean, default: false },
  options:     [{ type: String }],
  // Numeric-type config
  min:         { type: Number },
  max:         { type: Number },
  labelLeft:   { type: String, default: '' },
  labelRight:  { type: String, default: '' },
  iconStyle:   { type: String, enum: ['stars', 'numbers'], default: 'stars' },
  // Conditional logic — "show this field only when…"
  condition: {
    fieldId:  String,
    operator: { type: String, enum: ['equals', 'not_equals', 'is_one_of'] },
    value:    mongoose.Schema.Types.Mixed,
  },
}, { _id: false })

const formSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, default: 'Untitled form' },
  description: { type: String, default: '' },
  fields:      [fieldSchema],
  isPublished: { type: Boolean, default: false },
  shareId:     { type: String, unique: true, default: () => crypto.randomBytes(6).toString('hex') },
}, { timestamps: true })

module.exports = mongoose.model('Form', formSchema)
