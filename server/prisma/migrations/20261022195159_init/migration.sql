
CREATE TYPE "Category" AS ENUM ('starter', 'main', 'dessert', 'breakfast', 'vegetarian', 'baking');

CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "titleFr" TEXT NOT NULL,
    "titleEn" TEXT,
    "descriptionFr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "category" "Category" NOT NULL,
    "prepTime" INTEGER NOT NULL,
    "cookTime" INTEGER NOT NULL,
    "servings" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "chefNoteFr" TEXT,
    "chefNoteEn" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT,
    "quantity" DOUBLE PRECISION,
    "unitFr" TEXT NOT NULL,
    "unitEn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recipe_steps" (
    "id" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "instructionFr" TEXT NOT NULL,
    "instructionEn" TEXT,
    "tipFr" TEXT,
    "tipEn" TEXT,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recipe_tags" (
    "recipeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "recipe_tags_pkey" PRIMARY KEY ("recipeId","tagId")
);

CREATE TABLE "favorites" (
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("userId","recipeId")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE UNIQUE INDEX "tags_nameFr_key" ON "tags"("nameFr");

ALTER TABLE "recipes" ADD CONSTRAINT "recipes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorites" ADD CONSTRAINT "favorites_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
