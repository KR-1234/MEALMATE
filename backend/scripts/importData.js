/**
 * MealMate Data Import Script
 * Run: node scripts/importData.js
 * Safe to re-run — clears existing data first.
 */

const { PrismaClient } = require('@prisma/client')
const xlsx = require('xlsx')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parse/sync')

const prisma = new PrismaClient()

const NUTRITION_FILE   = path.join(__dirname, '../data/mealmate_nutrition_input.xlsx')
const INGREDIENTS_FILE = path.join(__dirname, '../data/recipe_ingredients.csv')
const PRICES_FILE      = path.join(__dirname, '../data/ingredient_prices_fake.csv')

async function importRecipes() {
  console.log('📋 Importing recipes from nutrition spreadsheet...')

  const wb = xlsx.readFile(NUTRITION_FILE)
  const ws = wb.Sheets[wb.SheetNames[0]]

  // header:1 returns arrays. Row 0 = headers, Row 1 = hints, Row 2+ = data
  // col index: 0=name, 1=url, 2=servings, 3=calories, 4=protein, 5=carbs, 6=fat, 7=cost
  const allRows = xlsx.utils.sheet_to_json(ws, { header: 1 })
  const dataRows = allRows.slice(2)

  const recipes = []
  for (const row of dataRows) {
    if (!row[0] || !row[1]) continue
    recipes.push({
      name:                       String(row[0]),
      url:                        String(row[1]),
      servings:                   Number(row[2]),
      caloriesPerServing:         Number(row[3]),
      proteinGPerServing:         Number(row[4]),
      carbsGPerServing:           Number(row[5]),
      fatGPerServing:             Number(row[6]),
      estimatedCostUsdPerServing: Number(row[7]),
    })
  }

  await prisma.recipeIngredient.deleteMany()
  await prisma.recipe.deleteMany()

  for (const recipe of recipes) {
    await prisma.recipe.create({ data: recipe })
  }

  console.log(`   ✓ Imported ${recipes.length} recipes`)
  return recipes.map(r => r.url)
}

async function importIngredients(recipeUrls) {
  console.log('🥬 Importing recipe ingredients from CSV...')

  const raw = fs.readFileSync(INGREDIENTS_FILE, 'utf8')
  const rows = csv.parse(raw, { columns: true, skip_empty_lines: true })

  const recipeRecords = await prisma.recipe.findMany({ select: { id: true, url: true } })
  const urlToId = {}
  for (const r of recipeRecords) urlToId[r.url] = r.id

  let imported = 0
  let skipped  = 0

  for (const row of rows) {
    const recipeId = urlToId[row.url]
    if (!recipeId) { skipped++; continue }

    await prisma.recipeIngredient.create({
      data: {
        recipeId,
        ingredientKey: row.ingredient_key || '',
        ingredientRaw: row.ingredient_raw || '',
        quantity:      row.quantity ? parseFloat(row.quantity) : null,
        unit:          row.unit || null,
      }
    })
    imported++
  }

  console.log(`   ✓ Imported ${imported} ingredients (${skipped} skipped — recipes not in our set)`)
}

async function importPrices() {
  console.log('💰 Importing ingredient prices from CSV...')

  const raw = fs.readFileSync(PRICES_FILE, 'utf8')
  const rows = csv.parse(raw, { columns: true, skip_empty_lines: true })

  await prisma.ingredientPrice.deleteMany()

  let imported = 0
  for (const row of rows) {
    if (!row['ingredient_key'] || !row['price_per_unit']) continue
    await prisma.ingredientPrice.upsert({
      where:  { ingredientKey: row['ingredient_key'] },
      update: { canonicalUnit: row['canonical_unit'], pricePerUnit: parseFloat(row['price_per_unit']) },
      create: { ingredientKey: row['ingredient_key'], canonicalUnit: row['canonical_unit'], pricePerUnit: parseFloat(row['price_per_unit']) },
    })
    imported++
  }

  console.log(`   ✓ Imported ${imported} ingredient prices`)
}

async function main() {
  console.log('\n🍽️  MealMate Data Import\n')
  try {
    const recipeUrls = await importRecipes()
    await importIngredients(recipeUrls)
    await importPrices()
    console.log('\n✅ All data imported successfully.\n')
  } catch (err) {
    console.error('\n❌ Import failed:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()