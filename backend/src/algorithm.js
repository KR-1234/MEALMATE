/**
 * MealMate Algorithm
 * 
 * Takes user targets and a list of recipes from the database,
 * returns a scored and selected weekly meal plan.
 * 
 * This is pure JavaScript — no database calls here.
 * The Express route fetches data, this function processes it.
 */

/**
 * Score a single recipe against the user's per-meal targets.
 * Higher score = better match.
 */
function scoreRecipe(recipe, targets) {
  const { caloriesPerMeal, proteinPerMeal, budgetPerMeal } = targets

  // How close is each value to the target? (1.0 = perfect, lower = worse)
  const calorieScore = 1 - Math.abs(recipe.caloriesPerServing - caloriesPerMeal) / caloriesPerMeal
  const proteinScore = recipe.proteinGPerServing >= proteinPerMeal
    ? 1.0  // meets or exceeds target — full marks
    : recipe.proteinGPerServing / proteinPerMeal

  const budgetScore = recipe.estimatedCostUsdPerServing <= budgetPerMeal
    ? 1.0  // within budget — full marks
    : budgetPerMeal / recipe.estimatedCostUsdPerServing

  // Weighted: protein matters most for MealMate users, then budget, then calories
  return (proteinScore * 0.45) + (budgetScore * 0.35) + (calorieScore * 0.20)
}

/**
 * Build a 7-day meal plan from available recipes.
 * Avoids repeating the same recipe more than twice in a week.
 */
function buildWeeklyPlan(recipes, targets) {
  const { weeklyBudget, weeklyProtein, weeklyCalories } = targets

  // Per-meal targets (3 meals a day = 21 meals, but we plan 7 dinners for simplicity)
  const mealsPerWeek = 7
  const perMeal = {
    caloriesPerMeal: Math.round(weeklyCalories / mealsPerWeek),
    proteinPerMeal:  Math.round(weeklyProtein  / mealsPerWeek),
    budgetPerMeal:   +(weeklyBudget / mealsPerWeek).toFixed(2),
  }

  // Score every recipe
  const scored = recipes.map(recipe => ({
    ...recipe,
    score: scoreRecipe(recipe, perMeal)
  })).sort((a, b) => b.score - a.score)

  // Select 7 meals — allow repeats but not more than twice
  const usageCount = {}
  const plan = []

  for (const recipe of scored) {
    if (plan.length >= mealsPerWeek) break
    const uses = usageCount[recipe.id] || 0
    if (uses < 2) {
      plan.push(recipe)
      usageCount[recipe.id] = uses + 1
    }
  }

  // If we still need meals (fewer than 7 unique recipes), allow a third use
  if (plan.length < mealsPerWeek) {
    for (const recipe of scored) {
      if (plan.length >= mealsPerWeek) break
      const uses = usageCount[recipe.id] || 0
      if (uses < 3) {
        plan.push(recipe)
        usageCount[recipe.id] = uses + 1
      }
    }
  }

  // Calculate weekly totals for the chosen plan
  const totals = plan.reduce((acc, r) => ({
    calories: acc.calories + r.caloriesPerServing,
    protein:  acc.protein  + r.proteinGPerServing,
    cost:     acc.cost     + r.estimatedCostUsdPerServing,
  }), { calories: 0, protein: 0, cost: 0 })

  return {
    meals: plan.map((r, i) => ({
      day:      `Day ${i + 1}`,
      id:       r.id,
      name:     r.name,
      url:      r.url,
      servings: r.servings,
      nutrition: {
        calories: r.caloriesPerServing,
        protein:  r.proteinGPerServing,
        carbs:    r.carbsGPerServing,
        fat:      r.fatGPerServing,
      },
      estimatedCost: r.estimatedCostUsdPerServing,
      matchScore:    +(r.score * 100).toFixed(1), // 0–100
    })),
    weeklyTotals: {
      calories: Math.round(totals.calories),
      proteinG: Math.round(totals.protein),
      costUsd:  +totals.cost.toFixed(2),
    },
    targets: {
      weeklyCalories,
      weeklyProteinG: weeklyProtein,
      weeklyBudgetUsd: weeklyBudget,
    }
  }
}

module.exports = { buildWeeklyPlan }
