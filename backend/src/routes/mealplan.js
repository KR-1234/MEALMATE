/**
 * POST /api/meal-plan
 * 
 * Accepts user targets, queries the database,
 * runs the algorithm, returns a weekly meal plan.
 */

const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { buildWeeklyPlan } = require('../algorithm')

const router = express.Router()
const prisma = new PrismaClient()

router.post('/meal-plan', async (req, res) => {
  try {
    const { budget, protein, calories, goals } = req.body

    // ── Validate inputs ───────────────────────────────────────────────────────
    if (!budget || !protein || !calories) {
      return res.status(400).json({
        error: 'Missing required fields: budget, protein, calories'
      })
    }

    const weeklyBudget   = parseFloat(budget)
    const weeklyProtein  = parseFloat(protein)
    const weeklyCalories = parseFloat(calories)

    if (isNaN(weeklyBudget) || isNaN(weeklyProtein) || isNaN(weeklyCalories)) {
      return res.status(400).json({ error: 'budget, protein, and calories must be numbers' })
    }

    // ── Query database ────────────────────────────────────────────────────────
    // Fetch all recipes — the algorithm does the filtering and scoring
    // As your dataset grows, add a WHERE clause here to pre-filter by budget
    const recipes = await prisma.recipe.findMany({
      where: {
        // Pre-filter: only recipes where cost per serving is plausibly within budget
        estimatedCostUsdPerServing: {
          lte: weeklyBudget / 5 // at minimum affordable 5x per week
        }
      }
    })

    if (recipes.length === 0) {
      return res.status(404).json({
        error: 'No recipes found within your budget. Try increasing your weekly budget.'
      })
    }

    // ── Run algorithm ─────────────────────────────────────────────────────────
    const plan = buildWeeklyPlan(recipes, {
      weeklyBudget,
      weeklyProtein,
      weeklyCalories,
    })

    // ── Return result ─────────────────────────────────────────────────────────
    res.json({
      success: true,
      goals: goals || null,
      plan,
    })

  } catch (err) {
    console.error('meal-plan error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/recipes — useful for debugging, see all recipes in DB
router.get('/recipes', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany()
    res.json({ count: recipes.length, recipes })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
