# Recipe Box

Application web de carnet culinaire développée avec React 19 et Express. Elle permet de rechercher, consulter, créer et organiser des recettes, d'ajuster dynamiquement les portions en cuisine, et d'enregistrer des recettes publiques ou privées.

L'interface est entièrement bilingue (Français / Anglais).

---

## Fonctionnalités

- **Catalogue culinaire** : Recherche instantanée, filtres par catégorie (entrées, plats, desserts, boulangerie, etc.), par temps de préparation et par niveau de difficulté.
- **Fiche recette interactive** : Recalcul dynamique des quantités selon le nombre de portions choisi, suivi des ingrédients et des étapes de préparation sous forme de checklist.
- **Authentification & Profil** : Inscription et connexion sécurisées par mot de passe chiffré (bcrypt) et jetons JWT.
- **Recettes publiques et privées** : Possibilité de créer des recettes visibles par tous ou réservées à son auteur. Seul l'auteur d'une recette peut la modifier ou la supprimer.
- **Favoris persistants** : Sauvegarde des recettes favorites en base de données pour les utilisateurs connectés, avec repli local pour les visiteurs anonymes.
- **Hébergement des photos** : Téléversement direct des photos culinaires vers Cloudinary avec validation des formats autorisés (JPEG, PNG, WebP) et limite de 5 Mo. Possibilité d'utiliser également des URL d'images externes.
- **Interface bilingue** : Bascule instantanée Français / Anglais sans rechargement de page.

---

## Stack technique

### Frontend
- **React 19** avec **TypeScript**
- **Vite** (serveur de développement et bundler)
- **Tailwind CSS v4**
- **Lucide React** (icônes)

### Backend
- **Node.js** avec **Express** et **TypeScript**
- **Prisma ORM**
- **PostgreSQL** (hébergé sur Neon)
- **bcrypt** (hachage des mots de passe)
- **jsonwebtoken** (authentification stateless par jeton Bearer)
- **Cloudinary SDK** & **Multer** (gestion des images en mémoire)

---

## Prérequis

- **Node.js** (version 18 ou supérieure recommandée)
- **npm** (inclus avec Node.js)
- Une instance **PostgreSQL** accessible (ex. Neon, Supabase, ou instance locale)
- *(Optionnel)* Un compte **Cloudinary** pour le stockage des photos téléversées

---

## Installation et configuration locale

### 1. Cloner le projet et installer les dépendances

Installez les dépendances du frontend (à la racine) puis celles du backend :

```bash
# Dépendances frontend
npm install

# Dépendances backend
cd server
npm install
cd ..
```

### 2. Configurer les variables d'environnement du backend

Créez un fichier `.env` dans le dossier `server/` (en vous basant sur `server/.env.example`) :

```env
PORT=3001
CLIENT_URL=http://localhost:3000

# Base de données PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# Authentification JWT
JWT_SECRET="une_cle_secrete_aleatoire_et_longue"
JWT_EXPIRES_IN="7d"

# Hébergement d'images Cloudinary (optionnel)
CLOUDINARY_CLOUD_NAME="votre_cloud_name"
CLOUDINARY_API_KEY="votre_api_key_15_chiffres"
CLOUDINARY_API_SECRET="votre_api_secret"
```

### 3. Initialiser la base de données

Depuis le dossier `server/`, appliquez les migrations Prisma et insérez les recettes de démonstration :

```bash
cd server
npm run db:migrate
npm run db:seed
cd ..
```

---

## Lancement de l'application

Pour faire tourner le projet en local, lancez deux terminaux depuis la racine du projet :

### Terminal 1 : Backend Express (API)
```bash
cd server
npm run dev
```
Le serveur démarre sur **`http://localhost:3001`**. Le point de contrôle de santé est disponible sur `http://localhost:3001/api/health`.

### Terminal 2 : Frontend React (Vite)
```bash
npm run dev
```
L'application s'ouvre sur **`http://localhost:3000`**. Les requêtes `/api/*` sont automatiquement relayées vers le backend via le proxy Vite.

---

## Scripts disponibles

### Racine (Frontend)
- `npm run dev` : Lance le serveur de développement Vite (port 3000).
- `npm run build` : Compile le code TypeScript et produit le bundle de production dans `dist/`.
- `npm run preview` : Prévisualise le build de production en local.
- `npm run lint` : Vérifie les types TypeScript (`tsc --noEmit`).
- `npm test` : Exécute les tests unitaires frontend (recalcul des portions, filtres, tri).

### Dossier `server/` (Backend)
- `npm run dev` : Lance le serveur en mode observation avec `tsx watch`.
- `npm run build` : Compile le backend en JavaScript standard dans `dist/`.
- `npm test` : Exécute l'ensemble des suites de tests (authentification, uploads, CRUD, favoris).
- `npm run db:migrate` : Applique les migrations Prisma à la base PostgreSQL.
- `npm run db:seed` : Réinsère les 8 recettes initiales en base sans créer de doublons.
- `npm run db:studio` : Ouvre l'interface Prisma Studio pour visualiser et éditer les données.

---

## Structure du projet

```text
recipe-box/
├── package.json              # Dépendances et scripts du frontend
├── vite.config.ts            # Configuration Vite et proxy vers le port 3001
├── tsconfig.json             # Configuration TypeScript globale
├── index.html                # Point d'entrée HTML
│
├── src/                      # Code source du frontend React
│   ├── components/           # Composants réutilisables (Navbar, Cards, Modals, etc.)
│   ├── context/              # Contexte d'authentification utilisateur
│   ├── data/                 # Données de démonstration et types de référence
│   ├── i18n/                 # Dictionnaire de traduction FR/EN et contexte de langue
│   ├── pages/                # Vues principales (Accueil, Détail, Formulaire, Favoris)
│   ├── services/             # Clients d'appel API REST (recettes, auth, favoris)
│   └── types/                # Définitions des types TypeScript partagés
│
├── server/                   # Backend Express & ORM Prisma
│   ├── package.json          # Dépendances et scripts du serveur
│   ├── tsconfig.json         # Configuration TypeScript du serveur
│   ├── prisma/
│   │   ├── schema.prisma     # Schéma de base de données (User, Recipe, Favorite, etc.)
│   │   ├── migrations/       # Historique des migrations SQL
│   │   └── seed.ts           # Script d'insertion des données de démonstration
│   ├── src/
│   │   ├── controllers/      # Contrôleurs HTTP (auth, recettes, favoris, uploads)
│   │   ├── lib/              # Instances Prisma et Cloudinary
│   │   ├── middleware/       # Middlewares JWT et Multer
│   │   ├── routes/           # Définition des routes de l'API REST
│   │   ├── services/         # Logique métier et requêtes base de données
│   │   └── validators/       # Validation des données entrantes et magic bytes
│   └── tests/                # Suites de tests automatisés (Phases 4 à 7)
│
└── tests/                    # Tests unitaires du frontend
```

---

## Sécurité & Bonnes pratiques

- **Secrets protégés** : Le fichier `server/.env` contenant la chaîne de connexion PostgreSQL, la clé secrète JWT et les identifiants Cloudinary est exclu du suivi Git via `.gitignore`.
- **Validation serveur stricte** : Les droits d'accès aux recettes privées et les opérations d'écriture (`POST`, `PUT`, `DELETE`) sont contrôlés côté backend, indépendamment de l'interface graphique.
- **Vérification des téléversements** : Les images envoyées sont inspectées par analyse des octets d'en-tête (*magic bytes*) pour interdire les fichiers exécutables ou corrompus déguisés en images.
