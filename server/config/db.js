const mongoose = require('mongoose')

const connectDB = async () => {
  console.log('URI loaded:', !!process.env.MONGO_URI)
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
