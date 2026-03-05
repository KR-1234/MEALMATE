# MealMate API

Express + Prisma + PostgreSQL backend for MealMate.

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Set up your database
Create a free PostgreSQL database on [Railway](https://railway.app):
- New project → Add PostgreSQL
- Copy the `DATABASE_URL` from the Variables tab

### 3. Configure environment
```bash
cp .env.example .env
# Paste your DATABASE_URL into .env
```

### 4. Run database migrations
This creates the tables in PostgreSQL based on your Prisma schema:
```bash
npm run db:migrate
```

### 5. Copy your data files
Place these three files in `backend/data/`:
- `mealmate_nutrition_input.xlsx`
- `recipe_ingredients.csv`
- `ingredient_prices_fake.csv`

### 6. Import your data
```bash
npm run db:import
```

### 7. Start the server
```bash
npm run dev
```

Server runs at `http://localhost:3001`

---

## API Endpoints

### `POST /api/meal-plan`
Generate a weekly meal plan based on user targets.

**Request body:**
```json
{
  "budget": 120,
  "protein": 700,
  "calories": 14000,
  "goals": "Build lean muscle while keeping meals affordable"
}
```

**Response:**
```json
{
  "success": true,
  "goals": "Build lean muscle...",
  "plan": {
    "meals": [
      {
        "day": "Day 1",
        "name": "Crispy Sous Vide Chicken Thighs",
        "url": "https://...",
        "nutrition": { "calories": 691, "protein": 52, "carbs": 6, "fat": 42 },
        "estimatedCost": 14,
        "matchScore": 87.4
      }
    ],
    "weeklyTotals": { "calories": 3500, "proteinG": 280, "costUsd": 98 },
    "targets": { "weeklyCalories": 14000, "weeklyProteinG": 700, "weeklyBudgetUsd": 120 }
  }
}
```

### `GET /api/recipes`
Returns all recipes in the database. Useful for debugging.

### `GET /health`
Health check endpoint.

---

## Project Structure

```
backend/
├── src/
│   ├── index.js          ← Express server entry point
│   ├── algorithm.js      ← Scoring + meal plan logic (no DB calls)
│   └── routes/
│       └── mealplan.js   ← API route handlers (DB queries live here)
├── scripts/
│   └── importData.js     ← One-time data import script
├── data/                 ← Put your CSV/XLSX files here
├── prisma/
│   └── schema.prisma     ← Database schema
├── .env.example
└── package.json
```
