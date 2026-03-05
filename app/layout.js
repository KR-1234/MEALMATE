import './globals.css'

export const metadata = {
  title: 'MealMate — Weekly Meal Planner',
  description: 'Set your budget, protein, and calorie targets. Get a personalized weekly meal plan.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
