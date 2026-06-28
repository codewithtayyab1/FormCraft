// Pure Express app — no connectDB, no listen.
// Imported by index.js (production) and __tests__ (test).
const express = require('express')
const cors    = require('cors')

const authRoutes   = require('./routes/auth')
const formRoutes   = require('./routes/forms')
const publicRoutes = require('./routes/public')

const app = express()

// CLIENT_URL can be comma-separated for multiple origins (e.g. staging + production)
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

app.get('/', (req, res) => res.json({ status: 'ok', message: 'FormCraft API is running' }))
app.use('/api/auth',   authRoutes)
app.use('/api/forms',  formRoutes)
app.use('/api/public', publicRoutes)

module.exports = app
