import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

async function runIntegrationTests() {
  console.log('🧪 Début de la suite de tests : Intégration Frontend API...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ ÉCHEC: ${msg}`);
      failed++;
    }
  }

  const testEmail = `chef_front_${Date.now()}@example.com`;
  let token = '';
  let userId = '';
  let createdRecipeId = '';

  try {
    // ─── 1. Chargement initial des recettes (comme fait par le frontend) ─────
    console.log('1️⃣ Simulation du chargement initial (HomePage frontend)...');
    const resGetRecipes = await request(app).get('/api/recipes?limit=100');
    assert(resGetRecipes.status === 200, `GET /api/recipes répond avec 200 (reçu ${resGetRecipes.status})`);
    assert(Array.isArray(resGetRecipes.body.data), 'data est un tableau de recettes');
    assert(resGetRecipes.body.data.length >= 8, `Au moins 8 recettes chargées (${resGetRecipes.body.data.length})`);

    // Vérification de la structure attendue par le frontend
    const sample = resGetRecipes.body.data[0];
    assert(typeof sample.id === 'string', 'Champ id présent');
    assert(typeof sample.title === 'string', 'Champ title présent (traduit/mappé)');
    assert(typeof sample.description === 'string', 'Champ description présent');
    assert(typeof sample.category === 'string', 'Champ category présent');
    assert(typeof sample.prepTime === 'number', 'Champ prepTime présent');
    assert(typeof sample.cookTime === 'number', 'Champ cookTime présent');
    assert(Array.isArray(sample.ingredients), 'Champ ingredients présent');
    assert(Array.isArray(sample.steps), 'Champ steps présent');
    assert(Array.isArray(sample.tags), 'Champ tags présent');

    // ─── 2. Détail d'une recette (RecipeDetailPage frontend) ────────────────
    console.log('\n2️⃣ Simulation consultation fiche recette (RecipeDetailPage)...');
    const resGetDetail = await request(app).get('/api/recipes/rec-1');
    assert(resGetDetail.status === 200, `GET /api/recipes/rec-1 répond avec 200 (reçu ${resGetDetail.status})`);
    assert(resGetDetail.body.data?.id === 'rec-1', 'Recette Poulet Yassa bien ciblée');
    assert(resGetDetail.body.data?.ingredients?.length === 9, '9 ingrédients présents');
    assert(resGetDetail.body.data?.steps?.length === 5, '5 étapes présentes');

    // ─── 3. Inscription & Session (AuthModal frontend) ─────────────────────
    console.log('\n3️⃣ Simulation Inscription et Récupération Profil (AuthModal)...');
    const resReg = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'SecurePassword123!', name: 'Chef Frontend' });
    assert(resReg.status === 201, `Inscription réussie code 201 (reçu ${resReg.status})`);
    token = resReg.body.data?.token;
    userId = resReg.body.data?.user?.id;

    const resMe = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    assert(resMe.status === 200, `GET /api/auth/me valide la session utilisateur (reçu ${resMe.status})`);
    assert(resMe.body.data?.user?.email === testEmail, 'Email utilisateur conforme');

    // ─── 4. Création d'une recette privée (RecipeFormPage frontend) ────────
    console.log('\n4️⃣ Simulation Création Recette Privée (RecipeFormPage)...');
    const resCreate = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Mon Ragoût Secret',
        description: 'Recette familiale confidentielle',
        category: 'main',
        prepTime: 25,
        cookTime: 60,
        servings: 4,
        difficulty: 'medium',
        imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
        isPublic: false,
        ingredients: [
          { name: 'Boeuf', unit: 'g', quantity: 500, order: 1 },
          { name: 'Carottes', unit: 'pièces', quantity: 3, order: 2 },
        ],
        steps: [
          { stepNumber: 1, instruction: 'Saisir la viande' },
          { stepNumber: 2, instruction: 'Laisser mijoter' },
        ],
        tags: ['Mijoté', 'Hiver'],
      });

    assert(resCreate.status === 201, `Recette créée avec succès code 201 (reçu ${resCreate.status})`);
    assert(resCreate.body.data?.isPublic === false, 'isPublic: false persisté');
    assert(resCreate.body.data?.authorId === userId, 'authorId correspond à l\'utilisateur connecté');
    createdRecipeId = resCreate.body.data?.id;

    // ─── 5. Visibilité conditionnelle frontend ──────────────────────────────
    console.log('\n5️⃣ Vérification visibilité : visiteur anonyme vs connecté...');
    const resAnonList = await request(app).get('/api/recipes?limit=100');
    const anonIds = resAnonList.body.data.map((r: any) => r.id);
    assert(!anonIds.includes(createdRecipeId), 'La recette privée n\'apparaît PAS pour un visiteur non connecté');

    const resAuthList = await request(app)
      .get('/api/recipes?limit=100')
      .set('Authorization', `Bearer ${token}`);
    const authIds = resAuthList.body.data.map((r: any) => r.id);
    assert(authIds.includes(createdRecipeId), 'La recette privée APPARAÎT pour le chef connecté (son auteur)');

    // ─── 6. Modification de recette (RecipeFormPage - mode edit) ────────────
    console.log('\n6️⃣ Simulation Modification Recette (mode édition)...');
    const resUpdate = await request(app)
      .put(`/api/recipes/${createdRecipeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Mon Ragoût Secret (Version 2)',
        servings: 6,
      });
    assert(resUpdate.status === 200, `Modification réussie code 200 (reçu ${resUpdate.status})`);
    assert(resUpdate.body.data?.title === 'Mon Ragoût Secret (Version 2)', 'Titre mis à jour');
    assert(resUpdate.body.data?.servings === 6, 'Portions mises à jour');

    // ─── 7. Suppression de recette (RecipeDetailPage frontend) ──────────────
    console.log('\n7️⃣ Simulation Suppression Recette par son auteur...');
    const resDelete = await request(app)
      .delete(`/api/recipes/${createdRecipeId}`)
      .set('Authorization', `Bearer ${token}`);
    assert(resDelete.status === 200, `Suppression réussie code 200 (reçu ${resDelete.status})`);

  } finally {
    // ─── Nettoyage ──────────────────────────────────────────────────────────
    console.log('\n🧹 Nettoyage des données de test...');
    if (createdRecipeId) {
      await prisma.recipe.deleteMany({ where: { id: createdRecipeId } });
    }
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await prisma.tag.deleteMany({ where: { nameFr: { in: ['Mijoté', 'Hiver'] } } });

    // ─── Vérification de l'intégrité des 8 recettes démo ────────────────────
    console.log('\n🔍 Contrôle d\'intégrité des 8 recettes de démonstration...');
    const demoRecipes = await prisma.recipe.findMany({
      where: { id: { in: ['rec-1', 'rec-2', 'rec-3', 'rec-4', 'rec-5', 'rec-6', 'rec-7', 'rec-8'] } },
      include: { ingredients: true, steps: true, tags: true },
    });

    assert(demoRecipes.length === 8, `8 recettes de démo présentes (${demoRecipes.length}/8)`);
    const totalIngredients = demoRecipes.reduce((acc, r) => acc + r.ingredients.length, 0);
    const totalSteps = demoRecipes.reduce((acc, r) => acc + r.steps.length, 0);
    assert(totalIngredients === 56, `56 ingrédients de démo intacts (${totalIngredients}/56)`);
    assert(totalSteps === 40, `40 étapes de démo intactes (${totalSteps}/40)`);

    await prisma.$disconnect();
  }

  console.log(`\n========================================`);
  console.log(`RÉSULTAT TOTAL : ${passed} réussis, ${failed} échoués`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runIntegrationTests().catch((err) => {
  console.error('Fatal integration test error:', err);
  process.exit(1);
});
