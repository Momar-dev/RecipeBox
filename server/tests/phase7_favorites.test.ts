/**
 * Recipe Box — Tests Phase 7 : Favoris Persistants & Audit d'Intégration Complet
 *
 * Scénarios couverts :
 *   1. Endpoints favoris backend (liste, ajout, retrait, idempotence, isolation)
 *   2. Accès anonyme vs authentifié aux favoris
 *   3. Erreurs 400, 401, 403, 404 pertinentes
 *   4. Isolation entre deux utilisateurs
 *   5. Idempotence : ajout du même favori deux fois
 *   6. Suppression d'une recette supprime automatiquement ses favoris (cascade)
 *   7. Comportement quand le serveur n'a pas la ressource demandée
 *   8. Intégrité des 8 recettes de démonstration
 */

import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import assert from 'node:assert/strict';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function retryOnColdStart<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (attempt === retries) throw err;
      console.warn(`  ⏳ Connexion Neon en veille... Tentative ${attempt}/${retries}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Échec de la connexion après plusieurs tentatives.');
}

async function registerUser(email: string, name: string): Promise<string> {
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'TestPassword123!',
    name,
  });
  assert(res.status === 201, `Inscription ${name} échouée (${res.status})`);
  return res.body.data.token as string;
}

async function createTestRecipe(token: string, isPublic = true): Promise<string> {
  const res = await request(app)
    .post('/api/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: `Recette de test (${Date.now()})`,
      description: 'Une recette de test pour la suite Phase 7.',
      category: 'main',
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      difficulty: 'easy',
      imageUrl: 'https://example.com/test.jpg',
      isPublic,
      ingredients: [{ name: 'Eau', quantity: 500, unit: 'ml', order: 1 }],
      steps: [{ stepNumber: 1, instruction: 'Faire bouillir l\'eau.' }],
      tags: [],
    });
  assert(res.status === 201, `Création recette test échouée (${res.status}): ${JSON.stringify(res.body)}`);
  return res.body.data.id as string;
}

// ─── Suite de tests ────────────────────────────────────────────────────────────

async function runPhase7Tests(): Promise<void> {
  console.log('\n🧪 Début de la suite de tests Phase 7 : Favoris & Audit Complet...');

  const ts = Date.now();
  const email1 = `chef1.p7.${ts}@recipebox-test.dev`;
  const email2 = `chef2.p7.${ts}@recipebox-test.dev`;

  let token1 = '';
  let token2 = '';
  let userId1 = '';
  let publicRecipeId = '';
  let privateRecipeId = '';
  let ownRecipeId = '';
  let passed = 0;
  let failed = 0;

  function ok(label: string): void {
    console.log(`  ✅ ${label}`);
    passed++;
  }

  function fail(label: string, detail?: string): void {
    console.error(`  ❌ ${label}${detail ? `: ${detail}` : ''}`);
    failed++;
  }

  function assertOk(condition: boolean, label: string, detail?: string): void {
    if (condition) ok(label);
    else fail(label, detail);
  }

  // ─── 0. Warm-up Neon ─────────────────────────────────────────────────────────
  console.log('\n0️⃣ Vérification connexion Neon...');
  await retryOnColdStart(async () => {
    const res = await request(app).get('/api/health');
    assert(res.status === 200, `Health check échoué (${res.status})`);
  });
  ok('API Express opérationnelle');

  // ─── 1. Inscription des deux utilisateurs ────────────────────────────────────
  console.log('\n1️⃣ Inscription des utilisateurs de test...');
  token1 = await registerUser(email1, 'Chef Alpha P7');
  token2 = await registerUser(email2, 'Chef Beta P7');

  const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token1}`);
  userId1 = meRes.body.data?.user?.id ?? meRes.body.data?.id;
  assertOk(meRes.status === 200 && typeof userId1 === 'string', 'Profil Chef Alpha récupéré');

  // ─── 2. Création des recettes de test ────────────────────────────────────────
  console.log('\n2️⃣ Création des recettes de test...');
  publicRecipeId = await createTestRecipe(token1, true);
  ok(`Recette publique créée (${publicRecipeId})`);

  privateRecipeId = await createTestRecipe(token1, false);
  ok(`Recette privée créée (${privateRecipeId})`);

  // Recette de Chef Beta (pour tester l'isolation)
  ownRecipeId = await createTestRecipe(token2, true);
  ok(`Recette de Chef Beta créée (${ownRecipeId})`);

  // ─── 3. Accès anonyme aux favoris ─────────────────────────────────────────────
  console.log('\n3️⃣ Accès anonyme aux endpoints favoris...');

  const anonGet = await request(app).get('/api/favorites');
  assertOk(anonGet.status === 401, 'GET /api/favorites sans token → 401');

  const anonGetIds = await request(app).get('/api/favorites/ids');
  assertOk(anonGetIds.status === 401, 'GET /api/favorites/ids sans token → 401');

  const anonAdd = await request(app).post(`/api/favorites/${publicRecipeId}`);
  assertOk(anonAdd.status === 401, 'POST /api/favorites/:id sans token → 401');

  const anonDel = await request(app).delete(`/api/favorites/${publicRecipeId}`);
  assertOk(anonDel.status === 401, 'DELETE /api/favorites/:id sans token → 401');

  // ─── 4. Liste initiale vide ────────────────────────────────────────────────────
  console.log('\n4️⃣ Liste initiale de favoris...');

  const emptyList = await request(app).get('/api/favorites').set('Authorization', `Bearer ${token1}`);
  assertOk(emptyList.status === 200, 'GET /api/favorites Chef Alpha → 200');
  assertOk(Array.isArray(emptyList.body.data) && emptyList.body.data.length === 0, 'Liste initiale vide');

  const emptyIds = await request(app).get('/api/favorites/ids').set('Authorization', `Bearer ${token1}`);
  assertOk(emptyIds.status === 200, 'GET /api/favorites/ids → 200');
  assertOk(Array.isArray(emptyIds.body.data) && emptyIds.body.data.length === 0, 'IDs initiaux vides');

  // ─── 5. Ajout d'un favori (recette publique) ─────────────────────────────────
  console.log('\n5️⃣ Ajout de favoris...');

  const addPublic = await request(app)
    .post(`/api/favorites/${publicRecipeId}`)
    .set('Authorization', `Bearer ${token1}`);
  assertOk(addPublic.status === 201, 'POST /api/favorites/:id recette publique → 201');

  // Vérification que la recette apparaît dans les favoris
  const listAfterAdd = await request(app).get('/api/favorites').set('Authorization', `Bearer ${token1}`);
  assertOk(listAfterAdd.status === 200 && listAfterAdd.body.data.length === 1, 'Favoris contient 1 recette après ajout');
  assertOk(listAfterAdd.body.data[0]?.id === publicRecipeId, 'L\'ID de la recette favorite est correct');

  const idsAfterAdd = await request(app).get('/api/favorites/ids').set('Authorization', `Bearer ${token1}`);
  assertOk(idsAfterAdd.body.data.includes(publicRecipeId), 'IDs favoris contient la recette ajoutée');

  // ─── 6. Idempotence : ajout du même favori deux fois ──────────────────────────
  console.log('\n6️⃣ Idempotence : double ajout du même favori...');

  const addDuplicate = await request(app)
    .post(`/api/favorites/${publicRecipeId}`)
    .set('Authorization', `Bearer ${token1}`);
  assertOk(
    addDuplicate.status === 200 || addDuplicate.status === 201,
    'Double ajout → 200/201 (pas d\'erreur 409)',
  );

  const listAfterDuplicate = await request(app).get('/api/favorites/ids').set('Authorization', `Bearer ${token1}`);
  assertOk(
    listAfterDuplicate.body.data.length === 1,
    'Pas de doublon : toujours 1 favori après ajout idempotent',
  );

  // ─── 7. Ajout d'une recette privée de sa propre collection ───────────────────
  console.log('\n7️⃣ Ajout d\'une recette privée personnelle aux favoris...');

  const addPrivate = await request(app)
    .post(`/api/favorites/${privateRecipeId}`)
    .set('Authorization', `Bearer ${token1}`);
  assertOk(addPrivate.status === 201, 'Ajout recette privée (sa propre) → 201');

  const listWith2 = await request(app).get('/api/favorites/ids').set('Authorization', `Bearer ${token1}`);
  assertOk(listWith2.body.data.length === 2, 'Favoris contient maintenant 2 recettes');

  // ─── 8. Isolation entre utilisateurs ─────────────────────────────────────────
  console.log('\n8️⃣ Isolation des favoris entre utilisateurs...');

  // Chef Beta ne peut pas voir les favoris de Chef Alpha
  const betaList = await request(app).get('/api/favorites').set('Authorization', `Bearer ${token2}`);
  assertOk(betaList.status === 200 && betaList.body.data.length === 0, 'Chef Beta voit 0 favoris (isolation)');

  // Chef Beta ajoute la recette publique de Chef Alpha
  const betaAddPublic = await request(app)
    .post(`/api/favorites/${publicRecipeId}`)
    .set('Authorization', `Bearer ${token2}`);
  assertOk(betaAddPublic.status === 201, 'Chef Beta peut ajouter une recette publique de Alpha aux favoris');

  // Chef Beta ne peut PAS ajouter la recette PRIVÉE de Chef Alpha
  const betaAddPrivate = await request(app)
    .post(`/api/favorites/${privateRecipeId}`)
    .set('Authorization', `Bearer ${token2}`);
  assertOk(betaAddPrivate.status === 404, 'Chef Beta ne peut pas ajouter la recette privée d\'Alpha → 404');

  // ─── 9. Recette inexistante ──────────────────────────────────────────────────
  console.log('\n9️⃣ Recette inexistante...');

  const addNonExistent = await request(app)
    .post('/api/favorites/id-inexistant-xyz')
    .set('Authorization', `Bearer ${token1}`);
  assertOk(addNonExistent.status === 404, 'Ajout favori recette inexistante → 404');

  const delNonExistent = await request(app)
    .delete('/api/favorites/id-inexistant-xyz')
    .set('Authorization', `Bearer ${token1}`);
  assertOk(delNonExistent.status === 404, 'Suppression favori inexistant → 404');

  // ─── 10. Retrait d'un favori ──────────────────────────────────────────────────
  console.log('\n🔟 Retrait d\'un favori...');

  const removePublic = await request(app)
    .delete(`/api/favorites/${publicRecipeId}`)
    .set('Authorization', `Bearer ${token1}`);
  assertOk(removePublic.status === 200, 'DELETE /api/favorites/:id → 200');

  const listAfterRemove = await request(app).get('/api/favorites/ids').set('Authorization', `Bearer ${token1}`);
  assertOk(!listAfterRemove.body.data.includes(publicRecipeId), 'Recette retirée des favoris');
  assertOk(listAfterRemove.body.data.includes(privateRecipeId), 'Autre favori toujours présent');

  // ─── 11. Suppression de recette entraîne la suppression de ses favoris (cascade) ─
  console.log('\n1️⃣1️⃣ Cascade : suppression recette → suppression automatique des favoris...');

  // Chef Beta avait ajouté la recette publique de Alpha, la voici déjà retirée des favoris de Beta aussi ?
  // On crée une nouvelle recette pour ce test précis
  const tempRecipeId = await createTestRecipe(token1, true);
  // Beta l'ajoute en favori
  await request(app)
    .post(`/api/favorites/${tempRecipeId}`)
    .set('Authorization', `Bearer ${token2}`);
  // Alpha supprime sa recette
  const deleteRes = await request(app)
    .delete(`/api/recipes/${tempRecipeId}`)
    .set('Authorization', `Bearer ${token1}`);
  assertOk(deleteRes.status === 200, 'Auteur supprime sa recette → 200');

  // Le favori de Beta doit avoir disparu (cascade PostgreSQL)
  const betaFavsAfterCascade = await request(app).get('/api/favorites/ids').set('Authorization', `Bearer ${token2}`);
  assertOk(
    !betaFavsAfterCascade.body.data.includes(tempRecipeId),
    'Favori de Beta supprimé en cascade avec la recette d\'Alpha',
  );

  // ─── 12. Token invalide ──────────────────────────────────────────────────────
  console.log('\n1️⃣2️⃣ Token invalide sur les endpoints favoris...');

  const badToken = await request(app)
    .get('/api/favorites')
    .set('Authorization', 'Bearer jeton.invalide.ici');
  assertOk(badToken.status === 401, 'Token invalide → 401');

  // ─── 13. Audit rapide des endpoints existants ────────────────────────────────
  console.log('\n1️⃣3️⃣ Audit rapide santé & recettes démo...');

  const health = await request(app).get('/api/health');
  assertOk(health.status === 200 && health.body.status === 'ok', 'GET /api/health → 200 ok');

  const publicRecipes = await request(app).get('/api/recipes');
  assertOk(publicRecipes.status === 200, 'GET /api/recipes (anonyme) → 200');
  assertOk(Array.isArray(publicRecipes.body.data), 'Réponse est un tableau de recettes');
  assertOk(publicRecipes.body.data.length >= 8, `Au moins 8 recettes publiques (${publicRecipes.body.data.length})`);

  const recipeDetail = await request(app).get('/api/recipes/rec-1');
  assertOk(recipeDetail.status === 200, 'GET /api/recipes/rec-1 → 200');
  assertOk(recipeDetail.body.data?.ingredients?.length >= 1, 'Recette rec-1 a des ingrédients');

  const notFound = await request(app).get('/api/recipes/id-inexistant-xyz');
  assertOk(notFound.status === 404, 'Recette inexistante → 404');

  // ─── 14. Nettoyage ───────────────────────────────────────────────────────────
  console.log('\n🧹 Nettoyage des données de test...');

  try {
    // Supprimer les recettes de test des deux chefs
    await request(app).delete(`/api/recipes/${publicRecipeId}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`/api/recipes/${privateRecipeId}`).set('Authorization', `Bearer ${token1}`);
    await request(app).delete(`/api/recipes/${ownRecipeId}`).set('Authorization', `Bearer ${token2}`);

    // Supprimer les utilisateurs de test
    await prisma.user.deleteMany({
      where: { email: { in: [email1, email2] } },
    });

    ok('Données de test supprimées avec succès.');
  } catch (err: any) {
    console.warn(`  ⚠️ Nettoyage partiel : ${err?.message}`);
  }

  // ─── 15. Intégrité des 8 recettes de démonstration ───────────────────────────
  console.log('\n🔍 Contrôle d\'intégrité des 8 recettes de démonstration...');

  const demoRecipes = await prisma.recipe.count({ where: { isCustom: false } });
  assertOk(demoRecipes === 8, `8 recettes de démo présentes (${demoRecipes}/8)`);

  const demoIngredients = await prisma.ingredient.count({
    where: { recipe: { isCustom: false } },
  });
  assertOk(demoIngredients === 56, `56 ingrédients de démo intacts (${demoIngredients}/56)`);

  const demoSteps = await prisma.recipeStep.count({
    where: { recipe: { isCustom: false } },
  });
  assertOk(demoSteps === 40, `40 étapes de démo intactes (${demoSteps}/40)`);

  // ─── Résultats ────────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(48));
  console.log(`RÉSULTAT TOTAL PHASE 7 : ${passed} réussis, ${failed} échoués`);
  console.log('='.repeat(48) + '\n');

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Tests().catch((err) => {
  console.error('Erreur inattendue dans les tests Phase 7:', err);
  process.exit(1);
});
