'use client'

import styles from './MealPlan.module.css'

export default function MealPlan({ plan, goals }) {
  const { meals, weeklyTotals, targets } = plan

  return (
    <div className={styles.wrapper}>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.eyebrow}>Your Weekly Plan</span>
        {goals && <p className={styles.goalsText}>"{goals}"</p>}
      </div>

      {/* Weekly totals summary */}
      <div className={styles.totals}>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Est. Cost</span>
          <span className={styles.totalValue}>${weeklyTotals.costUsd}</span>
          <span className={styles.totalSub}>of ${targets.weeklyBudgetUsd} budget</span>
        </div>
        <div className={styles.totalDivider} />
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Total Protein</span>
          <span className={styles.totalValue}>{weeklyTotals.proteinG}g</span>
          <span className={styles.totalSub}>of {targets.weeklyProteinG}g target</span>
        </div>
        <div className={styles.totalDivider} />
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Total Calories</span>
          <span className={styles.totalValue}>{weeklyTotals.calories.toLocaleString()}</span>
          <span className={styles.totalSub}>of {targets.weeklyCalories.toLocaleString()} target</span>
        </div>
      </div>

      {/* Meal cards */}
      <div className={styles.meals}>
        {meals.map((meal, i) => (
          <div key={meal.id + i} className={styles.mealCard} style={{ animationDelay: `${i * 0.06}s` }}>
            <div className={styles.mealLeft}>
              <span className={styles.dayLabel}>{meal.day}</span>
              <a href={meal.url} target="_blank" rel="noopener noreferrer" className={styles.mealName}>
                {meal.name}
              </a>
              <span className={styles.servings}>Serves {meal.servings}</span>
            </div>
            <div className={styles.mealRight}>
              <div className={styles.macros}>
                <div className={styles.macro}>
                  <span className={styles.macroVal}>{meal.nutrition.calories}</span>
                  <span className={styles.macroLabel}>kcal</span>
                </div>
                <div className={styles.macro}>
                  <span className={styles.macroVal}>{meal.nutrition.protein}g</span>
                  <span className={styles.macroLabel}>protein</span>
                </div>
                <div className={styles.macro}>
                  <span className={styles.macroVal}>${meal.estimatedCost}</span>
                  <span className={styles.macroLabel}>cost</span>
                </div>
              </div>
              <div className={styles.scoreBar}>
                <div
                  className={styles.scoreBarFill}
                  style={{ width: `${meal.matchScore}%` }}
                />
              </div>
              <span className={styles.scoreLabel}>{meal.matchScore}% match</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
