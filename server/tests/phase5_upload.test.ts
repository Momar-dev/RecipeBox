import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/lib/prisma';
import { uploadService } from '../src/services/uploadService';
import { detectImageFormat, validateImageBuffer } from '../src/validators/imageValidator';

async function runUploadTests() {
  console.log('🧪 Début de la suite de tests Phase 5 : Upload d\'images & Cloudinary...\n');
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

  // Création d'un utilisateur de test pour les requêtes authentifiées
  const testEmail = `chef_upload_${Date.now()}@example.com`;
  let userToken = '';
  let userId = '';

  // Buffers d'images réels pour les tests
  // 1x1 pixel PNG valide (68 octets)
  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  // 1x1 pixel JPEG valide
  const validJpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xbf, 0x80, 0xff, 0xd9
  ]);

  // Fichier texte déguisé en image (usurpation d'extension)
  const fakePngBuffer = Buffer.from('<html><body>Contenu pirate malveillant</body></html>', 'utf-8');

  // Fichier dépassant 5 Mo (5 Mo + 100 Ko)
  const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 100 * 1024, 0xff);
  // Préfixer avec magic bytes PNG pour tester uniquement la limite de taille
  validPngBuffer.copy(oversizedBuffer, 0, 0, 8);

  try {
    // ─── -1. Warm up Neon Connection (reprise de veille / pooler Neon) ─────────
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // ─── 0. Préparation de la session de test ────────────────────────────────
    console.log('0️⃣ Enregistrement d\'un utilisateur de test...');
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: 'SecurePassword123!', name: 'Test Upload Chef' });
    assert(regRes.status === 201, `Utilisateur de test créé (code ${regRes.status})`);
    userToken = regRes.body.data?.token;
    userId = regRes.body.data?.user?.id;

    // ─── 1. Tests unitaires des validateurs d'images ─────────────────────────
    console.log('\n1️⃣ Validation des signatures d\'images (Magic Bytes)...');
    assert(detectImageFormat(validPngBuffer) === 'png', 'Détection PNG valide par magic bytes');
    assert(detectImageFormat(validJpegBuffer) === 'jpeg', 'Détection JPEG valide par magic bytes');
    assert(detectImageFormat(fakePngBuffer) === null, 'Rejet de faux PNG (HTML/texte) par magic bytes');
    
    const valResultFake = validateImageBuffer(fakePngBuffer, 'image/png');
    assert(!valResultFake.isValid, 'validateImageBuffer refuse un faux PNG');

    // ─── 2. Sécurité de l'endpoint POST /api/uploads/recipe-image ───────────
    console.log('\n2️⃣ Tests de sécurité de l\'endpoint /api/uploads/recipe-image...');

    // Rejet sans authentification (401)
    const resNoAuth = await request(app)
      .post('/api/uploads/recipe-image')
      .attach('image', validPngBuffer, 'test.png');
    assert(resNoAuth.status === 401, `Upload sans jeton Bearer rejeté avec 401 (reçu ${resNoAuth.status})`);

    // Rejet avec jeton invalide (401)
    const resBadToken = await request(app)
      .post('/api/uploads/recipe-image')
      .set('Authorization', 'Bearer token_invalide')
      .attach('image', validPngBuffer, 'test.png');
    assert(resBadToken.status === 401, `Upload avec token invalide rejeté avec 401 (reçu ${resBadToken.status})`);

    // Rejet sans fichier (400)
    const resNoFile = await request(app)
      .post('/api/uploads/recipe-image')
      .set('Authorization', `Bearer ${userToken}`);
    assert(resNoFile.status === 400, `Upload sans fichier rejeté avec 400 (reçu ${resNoFile.status})`);

    // Rejet format non autorisé (ex: PDF ou texte) (400)
    const resBadFormat = await request(app)
      .post('/api/uploads/recipe-image')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('image', Buffer.from('PDF content'), 'document.pdf');
    assert(resBadFormat.status === 400, `Upload de format interdit rejeté avec 400 (reçu ${resBadFormat.status})`);

    // Rejet usurpation MIME (extension .png mais contenu texte non-image) (400)
    const resSpoofedMime = await request(app)
      .post('/api/uploads/recipe-image')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('image', fakePngBuffer, 'virus.png');
    assert(resSpoofedMime.status === 400, `Upload d'image corrompue/usurpée rejeté avec 400 (reçu ${resSpoofedMime.status})`);

    // Rejet fichier trop lourd (> 5 Mo) (400)
    const resTooLarge = await request(app)
      .post('/api/uploads/recipe-image')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('image', oversizedBuffer, 'heavy.png');
    assert(resTooLarge.status === 400, `Upload > 5 Mo rejeté avec 400 (reçu ${resTooLarge.status})`);

    // ─── 3. Comportement selon la configuration Cloudinary ───────────────────
    console.log('\n3️⃣ Test du téléversement vers Cloudinary...');
    const isConfigured = uploadService.isConfigured();

    if (!isConfigured) {
      console.log('  ℹ️ Cloudinary n\'est pas encore configuré dans server/.env (identifiants absents).');
      const resUploadUnconfigured = await request(app)
        .post('/api/uploads/recipe-image')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', validPngBuffer, 'pixel.png');
      
      assert(
        resUploadUnconfigured.status === 503,
        `Réponse 503 Service Unavailable quand Cloudinary n'est pas configuré (reçu ${resUploadUnconfigured.status})`
      );
      assert(
        resUploadUnconfigured.body.code === 'CLOUDINARY_NOT_CONFIGURED',
        'Code d\'erreur CLOUDINARY_NOT_CONFIGURED explicite'
      );
    } else {
      console.log('  ℹ️ Cloudinary est configuré dans server/.env. Test de téléversement réel contrôlé...');
      const resUploadReal = await request(app)
        .post('/api/uploads/recipe-image')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('image', validPngBuffer, 'test_pixel.png');

      assert(resUploadReal.status === 201, `Téléversement Cloudinary réussi code 201 (reçu ${resUploadReal.status})`);
      assert(Boolean(resUploadReal.body.data?.secure_url), 'secure_url retournée');
      assert(Boolean(resUploadReal.body.data?.public_id), 'public_id retourné');

      // Nettoyage immédiat de l'image de test sur Cloudinary
      if (resUploadReal.body.data?.public_id) {
        console.log(`  🧹 Nettoyage de l'image de test Cloudinary : ${resUploadReal.body.data.public_id}`);
        const deleted = await uploadService.deleteImage(resUploadReal.body.data.public_id);
        assert(deleted, 'Image temporaire Cloudinary supprimée avec succès');
      }
    }

    // ─── 4. Création d'une recette avec URL Cloudinary ───────────────────────
    console.log('\n4️⃣ Intégration recette avec imageUrl Cloudinary...');
    const dummyCloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/v1234567890/recipe-box/recipes/sample.webp';
    const resCreateRecipe = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Recette avec Image Cloudinary',
        description: 'Recette illustrée',
        category: 'dessert',
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        difficulty: 'easy',
        imageUrl: dummyCloudinaryUrl,
        ingredients: [{ name: 'Chocolat', unit: 'g', quantity: 100 }],
        steps: [{ stepNumber: 1, instruction: 'Faire fondre le chocolat' }],
        tags: ['Chocolat', 'TestCloudinary'],
      });

    assert(resCreateRecipe.status === 201, `Recette créée avec imageUrl Cloudinary (code ${resCreateRecipe.status})`);
    assert(resCreateRecipe.body.data?.imageUrl === dummyCloudinaryUrl, 'imageUrl correctement persistée');

    // Nettoyage de la recette créée
    if (resCreateRecipe.body.data?.id) {
      await prisma.recipe.delete({ where: { id: resCreateRecipe.body.data.id } });
      await prisma.tag.deleteMany({ where: { nameFr: 'TestCloudinary' } });
    }

  } finally {
    // ─── Nettoyage ──────────────────────────────────────────────────────────
    console.log('\n🧹 Nettoyage de l\'utilisateur de test...');
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }

    // ─── Vérification intégrité des 8 recettes démo ─────────────────────────
    console.log('\n🔍 Vérification finale de l\'intégrité des 8 recettes de démonstration...');
    const demoRecipes = await prisma.recipe.findMany({
      where: { id: { in: ['rec-1', 'rec-2', 'rec-3', 'rec-4', 'rec-5', 'rec-6', 'rec-7', 'rec-8'] } },
      include: { ingredients: true, steps: true, tags: true },
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

runUploadTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
