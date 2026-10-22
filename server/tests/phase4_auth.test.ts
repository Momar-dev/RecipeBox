import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';

async function runTests() {
  console.log('🧪 Début de la suite de tests Phase 4 : Authentification et Sécurité...\n');
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

  const testUser1Email = `test_chef_${Date.now()}@example.com`;
  const testUser2Email = `test_baker_${Date.now()}@example.com`;
  const password = 'SuperSecretPassword123!';

  let tokenUser1 = '';
  let user1Id = '';
  let tokenUser2 = '';
  let user2Id = '';
  let publicRecipeId = '';
  let privateRecipeId = '';

  try {
    // ─── -1. Warm up Neon Connection (gère la reprise de veille Neon) ─────────
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        console.log(`  ⏳ Reprise de veille Neon (tentative ${attempt}/3)...`);
        await new Promise((r) => setTimeout(r, 2500));
      }
    }

    // ─── 1. Inscription (POST /api/auth/register) ───────────────────────────
    console.log('1️⃣ Tests Inscription (POST /api/auth/register)...');

    // Inscription valide User 1
    const resReg1 = await request(app)
      .post('/api/auth/register')
      .send({ email: testUser1Email, password, name: 'Chef Test' });
    
    assert(resReg1.status === 201, `Inscription user 1 code 201 (reçu ${resReg1.status})`);
    assert(typeof resReg1.body.data?.token === 'string', 'Token JWT retourné');
    assert(resReg1.body.data?.user?.email === testUser1Email, 'Email normalisé');
    assert(resReg1.body.data?.user?.passwordHash === undefined, 'passwordHash NON exposé');
    tokenUser1 = resReg1.body.data?.token;
    user1Id = resReg1.body.data?.user?.id;

    // Inscription avec email doublon (409)
    const resRegDup = await request(app)
      .post('/api/auth/register')
      .send({ email: testUser1Email.toUpperCase(), password, name: 'Autre Nom' });
    assert(resRegDup.status === 409, `Email doublon rejeté avec 409 (reçu ${resRegDup.status})`);

    // Inscription avec mot de passe trop court (400)
    const resRegShortPass = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@example.com', password: '123' });
    assert(resRegShortPass.status === 400, `Mot de passe court (< 8) rejeté avec 400 (reçu ${resRegShortPass.status})`);

    // Inscription avec email invalide (400)
    const resRegBadEmail = await request(app)
      .post('/api/auth/register')
      .send({ email: 'pas_un_email', password });
    assert(resRegBadEmail.status === 400, `Email invalide rejeté avec 400 (reçu ${resRegBadEmail.status})`);

    // Inscription valide User 2
    const resReg2 = await request(app)
      .post('/api/auth/register')
      .send({ email: testUser2Email, password, name: 'Baker Test' });
    assert(resReg2.status === 201, `Inscription user 2 code 201 (reçu ${resReg2.status})`);
    tokenUser2 = resReg2.body.data?.token;
    user2Id = resReg2.body.data?.user?.id;

    // ─── 2. Connexion (POST /api/auth/login) ───────────────────────────────
    console.log('\n2️⃣ Tests Connexion (POST /api/auth/login)...');

    // Connexion valide
    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser1Email.toUpperCase(), password });
    assert(resLogin.status === 200, `Connexion réussie avec code 200 (reçu ${resLogin.status})`);
    assert(typeof resLogin.body.data?.token === 'string', 'Token JWT retourné à la connexion');
    assert(resLogin.body.data?.user?.passwordHash === undefined, 'passwordHash non renvoyé');

    // Mauvais mot de passe (401)
    const resBadPass = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser1Email, password: 'WrongPassword999!' });
    assert(resBadPass.status === 401, `Mauvais mot de passe rejeté avec 401 (reçu ${resBadPass.status})`);

    // Email inconnu (401 avec message générique)
    const resBadEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inexistant@example.com', password });
    assert(resBadEmail.status === 401, `Email inconnu rejeté avec 401 (reçu ${resBadEmail.status})`);

    // ─── 3. Profil utilisateur (GET /api/auth/me) ──────────────────────────
    console.log('\n3️⃣ Tests Profil (GET /api/auth/me)...');

    // Profil avec token valide
    const resMe = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenUser1}`);
    assert(resMe.status === 200, `Profil récupéré avec code 200 (reçu ${resMe.status})`);
    assert(resMe.body.data?.user?.id === user1Id, 'ID utilisateur conforme');
    assert(resMe.body.data?.user?.email === testUser1Email, 'Email conforme');
    assert(resMe.body.data?.user?.passwordHash === undefined, 'passwordHash absent du profil');

    // Sans token (401)
    const resMeNoToken = await request(app).get('/api/auth/me');
    assert(resMeNoToken.status === 401, `GET /me sans token rejeté 401 (reçu ${resMeNoToken.status})`);

    // Avec token invalide (401)
    const resMeBadToken = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.payload');
    assert(resMeBadToken.status === 401, `GET /me token invalide rejeté 401 (reçu ${resMeBadToken.status})`);

    // Avec token expiré (401)
    const secret = process.env.JWT_SECRET || 'secret';
    const expiredToken = jwt.sign({ userId: user1Id, email: testUser1Email, name: 'Chef Test' }, secret, {
      expiresIn: '-1s',
    });
    const resMeExpired = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    assert(resMeExpired.status === 401, `GET /me token expiré rejeté 401 (reçu ${resMeExpired.status})`);

    // ─── 4. Création de recette (POST /api/recipes) ─────────────────────────
    console.log('\n4️⃣ Tests Création Recette (POST /api/recipes)...');

    // Tentative sans token -> 401
    const resCreateNoAuth = await request(app)
      .post('/api/recipes')
      .send({
        title: 'Recette Non Autorisée',
        description: 'Description',
        category: 'Dessert',
        prepTime: 10,
        cookTime: 10,
        servings: 2,
        difficulty: 'Facile',
        imageUrl: 'https://images.unsplash.com/test',
        ingredients: [{ name: 'Sucre', unit: 'g', quantity: 50 }],
        steps: [{ stepNumber: 1, instruction: 'Mélanger' }],
        tags: ['Test'],
      });
    assert(resCreateNoAuth.status === 401, `POST /recipes sans token rejeté avec 401 (reçu ${resCreateNoAuth.status})`);

    // Création d'une recette publique par User 1
    const resCreatePublic = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        title: 'Tarte Publique User 1',
        description: 'Délicieuse tarte publique',
        category: 'Dessert',
        prepTime: 20,
        cookTime: 30,
        servings: 6,
        difficulty: 'Facile',
        imageUrl: 'https://images.unsplash.com/public-pie',
        isPublic: true,
        ingredients: [{ name: 'Pommes', unit: 'pièces', quantity: 4 }],
        steps: [{ stepNumber: 1, instruction: 'Couper les pommes' }],
        tags: ['Tarte', 'TestAuth'],
      });
    assert(resCreatePublic.status === 201, `POST /recipes avec token créé code 201 (reçu ${resCreatePublic.status})`);
    assert(resCreatePublic.body.data?.authorId === user1Id, `authorId attribué via JWT (${resCreatePublic.body.data?.authorId})`);
    publicRecipeId = resCreatePublic.body.data?.id;

    // Création d'une recette privée par User 1
    const resCreatePrivate = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({
        title: 'Secret de Famille (Privée)',
        description: 'Recette secrète de grand-mère',
        category: 'Plat',
        prepTime: 15,
        cookTime: 45,
        servings: 4,
        difficulty: 'Moyen',
        imageUrl: 'https://images.unsplash.com/secret',
        isPublic: false,
        ingredients: [{ name: 'Ingrédient Secret', unit: 'pincée', quantity: 1 }],
        steps: [{ stepNumber: 1, instruction: 'Ne rien révéler' }],
        tags: ['Secret', 'TestAuth'],
      });
    assert(resCreatePrivate.status === 201, `Recette privée créée code 201 (reçu ${resCreatePrivate.status})`);
    assert(resCreatePrivate.body.data?.isPublic === false, 'isPublic = false respecté');
    assert(resCreatePrivate.body.data?.authorId === user1Id, 'Auteur = User 1');
    privateRecipeId = resCreatePrivate.body.data?.id;

    // ─── 5. Isolation et visibilité des recettes privées ─────────────────────
    console.log('\n5️⃣ Tests Visibilité et Isolation des Recettes Privées...');

    // GET /api/recipes sans authentification : la recette privée ne doit PAS apparaître
    const resGetPublicAnon = await request(app).get('/api/recipes?limit=100');
    const anonRecipeIds = resGetPublicAnon.body.data.map((r: any) => r.id);
    assert(anonRecipeIds.includes(publicRecipeId), 'Recette publique visible pour anonyme');
    assert(!anonRecipeIds.includes(privateRecipeId), 'Recette privée INVISIBLE pour anonyme');

    // GET /api/recipes authentifié en tant que User 2 : la recette privée de User 1 ne doit PAS apparaître
    const resGetPublicUser2 = await request(app)
      .get('/api/recipes?limit=100')
      .set('Authorization', `Bearer ${tokenUser2}`);
    const user2RecipeIds = resGetPublicUser2.body.data.map((r: any) => r.id);
    assert(!user2RecipeIds.includes(privateRecipeId), 'Recette privée de User 1 INVISIBLE pour User 2');

    // GET /api/recipes authentifié en tant que User 1 : la recette privée de User 1 DOIT apparaître
    const resGetPublicUser1 = await request(app)
      .get('/api/recipes?limit=100')
      .set('Authorization', `Bearer ${tokenUser1}`);
    const user1RecipeIds = resGetPublicUser1.body.data.map((r: any) => r.id);
    assert(user1RecipeIds.includes(privateRecipeId), 'Recette privée de User 1 VISIBLE pour son auteur (User 1)');

    // GET /api/recipes/:id pour la recette privée :
    // - Anonyme -> 403
    const resGetPrivateAnon = await request(app).get(`/api/recipes/${privateRecipeId}`);
    assert(resGetPrivateAnon.status === 403, `GET /recipes/:id privé sans auth refusé 403 (reçu ${resGetPrivateAnon.status})`);

    // - User 2 -> 403
    const resGetPrivateUser2 = await request(app)
      .get(`/api/recipes/${privateRecipeId}`)
      .set('Authorization', `Bearer ${tokenUser2}`);
    assert(resGetPrivateUser2.status === 403, `GET /recipes/:id privé par User 2 refusé 403 (reçu ${resGetPrivateUser2.status})`);

    // - User 1 -> 200
    const resGetPrivateUser1 = await request(app)
      .get(`/api/recipes/${privateRecipeId}`)
      .set('Authorization', `Bearer ${tokenUser1}`);
    assert(resGetPrivateUser1.status === 200, `GET /recipes/:id privé par son auteur réussi 200 (reçu ${resGetPrivateUser1.status})`);

    // ─── 6. Modification (PUT /api/recipes/:id) ────────────────────────────
    console.log('\n6️⃣ Tests Modification et Contrôle d\'Accès (PUT /api/recipes/:id)...');

    // Sans token -> 401
    const resPutNoAuth = await request(app)
      .put(`/api/recipes/${publicRecipeId}`)
      .send({ title: 'Tentative Piratage' });
    assert(resPutNoAuth.status === 401, `PUT sans token refusé 401 (reçu ${resPutNoAuth.status})`);

    // Modification d'une recette démo (authorId: null) -> 403
    const resPutDemo = await request(app)
      .put('/api/recipes/rec-1')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ title: 'Modification Recette Démo' });
    assert(resPutDemo.status === 403, `Modification recette démo protégée avec 403 (reçu ${resPutDemo.status})`);

    // Modification par un autre utilisateur (User 2 tente de modifier la recette de User 1) -> 403
    const resPutUser2 = await request(app)
      .put(`/api/recipes/${publicRecipeId}`)
      .set('Authorization', `Bearer ${tokenUser2}`)
      .send({ title: 'Titre Hacké' });
    assert(resPutUser2.status === 403, `Modification recette d'un tiers refusée avec 403 (reçu ${resPutUser2.status})`);

    // Modification légitime par son auteur (User 1) -> 200
    const resPutUser1 = await request(app)
      .put(`/api/recipes/${publicRecipeId}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ title: 'Tarte Publique Modifiée par Auteur' });
    assert(resPutUser1.status === 200, `Modification légitime par l'auteur réussie 200 (reçu ${resPutUser1.status})`);
    assert(resPutUser1.body.data?.title === 'Tarte Publique Modifiée par Auteur', 'Nouveau titre enregistré');

    // ─── 7. Suppression (DELETE /api/recipes/:id) ──────────────────────────
    console.log('\n7️⃣ Tests Suppression et Contrôle d\'Accès (DELETE /api/recipes/:id)...');

    // Sans token -> 401
    const resDelNoAuth = await request(app).delete(`/api/recipes/${publicRecipeId}`);
    assert(resDelNoAuth.status === 401, `DELETE sans token refusé 401 (reçu ${resDelNoAuth.status})`);

    // Suppression d'une recette démo -> 403
    const resDelDemo = await request(app)
      .delete('/api/recipes/rec-1')
      .set('Authorization', `Bearer ${tokenUser1}`);
    assert(resDelDemo.status === 403, `Suppression recette démo protégée avec 403 (reçu ${resDelDemo.status})`);

    // Suppression par un autre utilisateur (User 2) -> 403
    const resDelUser2 = await request(app)
      .delete(`/api/recipes/${publicRecipeId}`)
      .set('Authorization', `Bearer ${tokenUser2}`);
    assert(resDelUser2.status === 403, `Suppression recette d'un tiers refusée 403 (reçu ${resDelUser2.status})`);

    // Suppression légitime par l'auteur (User 1) -> 200
    const resDelUser1 = await request(app)
      .delete(`/api/recipes/${publicRecipeId}`)
      .set('Authorization', `Bearer ${tokenUser1}`);
    assert(resDelUser1.status === 200, `Suppression par l'auteur réussie 200 (reçu ${resDelUser1.status})`);

    // Suppression de la recette privée également
    const resDelPrivate = await request(app)
      .delete(`/api/recipes/${privateRecipeId}`)
      .set('Authorization', `Bearer ${tokenUser1}`);
    assert(resDelPrivate.status === 200, `Suppression recette privée réussie 200 (reçu ${resDelPrivate.status})`);

  } finally {
    // ─── Nettoyage complet des données de test ──────────────────────────────
    console.log('\n🧹 Nettoyage des données de test...');
    try {
      // Supprimer les recettes de test créées si elles subsistent
      if (publicRecipeId) {
        await prisma.recipe.deleteMany({ where: { id: publicRecipeId } });
      }
      if (privateRecipeId) {
        await prisma.recipe.deleteMany({ where: { id: privateRecipeId } });
      }
      // Supprimer les tags de test orphelins créés
      await prisma.tag.deleteMany({
        where: { nameFr: { in: ['TestAuth', 'Secret', 'Test'] } },
      });
      // Supprimer les utilisateurs de test
      await prisma.user.deleteMany({
        where: { email: { in: [testUser1Email, testUser2Email] } },
      });
      console.log('  ✅ Données de test supprimées avec succès.');
    } catch (cleanErr) {
      console.error('  ⚠️ Erreur nettoyage:', cleanErr);
    }

    // ─── Vérification de l'intégrité des 8 recettes de démo ────────────────
    console.log('\n🔍 Vérification de l\'intégrité des 8 recettes de démonstration...');
    const demoRecipes = await prisma.recipe.findMany({
      where: { id: { in: ['rec-1', 'rec-2', 'rec-3', 'rec-4', 'rec-5', 'rec-6', 'rec-7', 'rec-8'] } },
      include: {
        ingredients: true,
        steps: true,
        tags: true,
      },
    });

    assert(demoRecipes.length === 8, `Exactement 8 recettes démo présentes (${demoRecipes.length}/8)`);
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

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
