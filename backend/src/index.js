const express = require('express')
const cors    = require('cors')

const mealplanRoutes = require('./routes/mealplan')

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', mealplanRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mealmate-api' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🍽️  MealMate API running on http://localhost:${PORT}\n`)
})
