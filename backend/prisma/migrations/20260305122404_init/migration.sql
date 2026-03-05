-- CreateTable
CREATE TABLE "recipes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "servings" INTEGER NOT NULL,
    "caloriesPerServing" INTEGER NOT NULL,
    "proteinGPerServing" DOUBLE PRECISION NOT NULL,
    "carbsGPerServing" DOUBLE PRECISION NOT NULL,
    "fatGPerServing" DOUBLE PRECISION NOT NULL,
    "estimatedCostUsdPerServing" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "ingredientKey" TEXT NOT NULL,
    "ingredientRaw" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_prices" (
    "id" SERIAL NOT NULL,
    "ingredientKey" TEXT NOT NULL,
    "canonicalUnit" TEXT NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ingredient_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipes_url_key" ON "recipes"("url");

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_prices_ingredientKey_key" ON "ingredient_prices"("ingredientKey");

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
