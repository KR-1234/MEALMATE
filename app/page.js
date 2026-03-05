'use client'

import { useState } from 'react'
import MealPlan from './MealPlan'
import styles from './page.module.css'

export default function Home() {
  const [budget, setBudget]     = useState('')
  const [protein, setProtein]   = useState('')
  const [calories, setCalories] = useState('')
  const [goals, setGoals]       = useState('')
  const [plan, setPlan]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  async function handleSubmit() {
    if (!budget || !protein || !calories) {
      setError('Please fill in budget, protein, and calories.')
      return
    }
    setError(null)
    setLoading(true)
    setPlan(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/meal-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget:   parseFloat(budget),
          protein:  parseFloat(protein),
          calories: parseFloat(calories),
          goals,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }

      setPlan(data.plan)
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (err) {
      setError('Could not reach the API. Make sure your backend is running on port 3001.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>

        {/* Header */}
        <header className={styles.header}>
          <span className={styles.eyebrow}>Your weekly nutrition planner</span>
          <h1 className={styles.logo}>MEAL<span>MATE</span></h1>
          <p className={styles.tagline}>Set your targets. Get your plan.</p>
          <div className={styles.divider} />
        </header>

        {/* Form */}
        <div className={styles.card}>
          <p className={styles.cardLabel}>Weekly Targets</p>

          <div className={styles.fields}>
            <div className={styles.field}>
              <div className={styles.fieldLeft}>
                <label htmlFor="budget">Budget</label>
                <span className={styles.hint}>Total spend per week</span>
              </div>
              <div className={styles.inputWrap}>
                <input
                  id="budget"
                  type="number"
                  placeholder="e.g. 120"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  min="0"
                />
                <span className={styles.unit}>USD / wk</span>
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldLeft}>
                <label htmlFor="protein">Protein</label>
                <span className={styles.hint}>Total grams per week</span>
              </div>
              <div className={styles.inputWrap}>
                <input
                  id="protein"
                  type="number"
                  placeholder="e.g. 700"
                  value={protein}
                  onChange={e => setProtein(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  min="0"
                />
                <span className={styles.unit}>g / wk</span>
              </div>
            </div>

            <div className={styles.field} style={{ borderBottom: 'none' }}>
              <div className={styles.fieldLeft}>
                <label htmlFor="calories">Calories</label>
                <span className={styles.hint}>Total kcal per week</span>
              </div>
              <div className={styles.inputWrap}>
                <input
                  id="calories"
                  type="number"
                  placeholder="e.g. 14000"
                  value={calories}
                  onChange={e => setCalories(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  min="0"
                />
                <span className={styles.unit}>kcal / wk</span>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className={styles.goalsRow}>
            <label htmlFor="goals">Your Goals</label>
            <p className={styles.hint}>Describe what you're working towards</p>
            <textarea
              id="goals"
              placeholder="e.g. Build lean muscle while keeping meals simple and affordable..."
              value={goals}
              onChange={e => setGoals(e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.btnWrap}>
            <button onClick={handleSubmit} disabled={loading} className={styles.btn}>
              {loading ? 'Building your plan...' : 'Generate My Plan →'}
            </button>
          </div>
        </div>

        {/* Results */}
        {plan && (
          <div id="results">
            <MealPlan plan={plan} goals={goals} />
          </div>
        )}

      </div>
    </main>
  )
}
