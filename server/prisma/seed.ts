

import { PrismaClient, Category, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

const TAG_CATALOG = [
  { nameFr: 'Sénégal', nameEn: 'Senegal' },
  { nameFr: 'Volaille', nameEn: 'Poultry' },
  { nameFr: 'Mijoté', nameEn: 'Stew' },
  { nameFr: 'Agrumes', nameEn: 'Citrus' },
  { nameFr: 'Italie', nameEn: 'Italian' },
  { nameFr: 'Végétarien', nameEn: 'Vegetarian' },
  { nameFr: 'Réconfort', nameEn: 'Comfort' },
  { nameFr: 'Automne', nameEn: 'Autumn' },
  { nameFr: 'Pâtisserie', nameEn: 'Pastry' },
  { nameFr: 'Pommes', nameEn: 'Apples' },
  { nameFr: 'Caramel', nameEn: 'Caramel' },
  { nameFr: 'Tradition', nameEn: 'Classic' },
  { nameFr: 'Méditerranée', nameEn: 'Mediterranean' },
  { nameFr: 'Brunch', nameEn: 'Brunch' },
  { nameFr: 'Rapide', nameEn: 'Quick' },
  { nameFr: 'Entrée', nameEn: 'Starter' },
  { nameFr: 'Soupe', nameEn: 'Soup' },
  { nameFr: 'Chou-fleur', nameEn: 'Cauliflower' },
  { nameFr: 'Boulangerie', nameEn: 'Bakery' },
  { nameFr: 'Fermentation', nameEn: 'Fermentation' },
  { nameFr: 'Levain', nameEn: 'Sourdough' },
  { nameFr: 'Salade', nameEn: 'Salad' },
  { nameFr: 'Classique', nameEn: 'Classic' },
  { nameFr: 'Fraîcheur', nameEn: 'Fresh' },
  { nameFr: 'Chocolat', nameEn: 'Chocolate' },
  { nameFr: 'Dessert', nameEn: 'Dessert' },
  { nameFr: 'Gourmand', nameEn: 'Decadent' },
  { nameFr: 'Express', nameEn: 'Quick' },
] as const;

interface SeedIngredient {
  id: string;
  nameFr: string;
  nameEn?: string;
  quantity: number | null;
  unitFr: string;
  unitEn?: string;
  order: number;
}

interface SeedStep {
  id: string;
  stepNumber: number;
  instructionFr: string;
  instructionEn?: string;
  tipFr?: string;
  tipEn?: string;
}

interface SeedRecipe {
  id: string;
  titleFr: string;
  titleEn?: string;
  descriptionFr: string;
  descriptionEn?: string;
  category: Category;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: Difficulty;
  imageUrl: string;
  isFeatured: boolean;
  isCustom: boolean;
  isPublic: boolean;
  chefNoteFr?: string;
  chefNoteEn?: string;
  createdAt: Date;
  tagsFr: string[];
  ingredients: SeedIngredient[];
  steps: SeedStep[];
}

const SEED_RECIPES: SeedRecipe[] = [

  {
    id: 'rec-1',
    titleFr: 'Poulet Yassa Traditionnel Sénégalais',
    titleEn: 'Senegalese Chicken Yassa',
    descriptionFr: 'Une marinade généreuse aux oignons caramélisés, citron vert, moutarde de Dijon et piment doux qui sublime des cuisses de poulet dorées à point.',
    descriptionEn: 'A flavorful Senegalese specialty featuring golden chicken thighs simmered in a luscious sauce of slow-caramelized onions, fresh lime juice, and Dijon mustard.',
    category: Category.main,
    prepTime: 25,
    cookTime: 45,
    servings: 4,
    difficulty: Difficulty.medium,
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true,
    isCustom: false,
    isPublic: true,
    chefNoteFr: 'Laissez mariner le poulet au moins 2 heures (idéalement toute une nuit) avec les oignons émincés et le jus de citron vert pour un goût incomparable.',
    chefNoteEn: 'Marinate the chicken at least 2 hours (ideally overnight) with thinly sliced onions and lime juice for maximum flavor depth.',
    createdAt: new Date('2026-10-10T12:00:00.000Z'),
    tagsFr: ['Sénégal', 'Volaille', 'Mijoté', 'Agrumes'],
    ingredients: [
      { id: 'i1-1', nameFr: 'Cuisses de poulet fermier', nameEn: 'Farmhouse chicken thighs', quantity: 4, unitFr: 'pièces', order: 0 },
      { id: 'i1-2', nameFr: 'Oignons jaunes', nameEn: 'Yellow onions', quantity: 6, unitFr: 'grosses pièces', order: 1 },
      { id: 'i1-3', nameFr: 'Citrons verts (pressés)', nameEn: 'Fresh limes (juiced)', quantity: 4, unitFr: 'pièces', order: 2 },
      { id: 'i1-4', nameFr: 'Moutarde de Dijon', nameEn: 'Dijon mustard', quantity: 3, unitFr: 'c. à soupe', order: 3 },
      { id: 'i1-5', nameFr: "Gousses d'ail", nameEn: 'Garlic cloves', quantity: 4, unitFr: 'gousses', order: 4 },
      { id: 'i1-6', nameFr: "Huile d'arachide ou tournesol", nameEn: 'Peanut or sunflower oil', quantity: 4, unitFr: 'c. à soupe', order: 5 },
      { id: 'i1-7', nameFr: 'Feuilles de laurier', nameEn: 'Bay leaves', quantity: 2, unitFr: 'feuilles', order: 6 },
      { id: 'i1-8', nameFr: 'Piment végétarien ou habanero entier', nameEn: 'Habanero or scotch bonnet chili (whole)', quantity: 1, unitFr: 'pièce', order: 7 },
      { id: 'i1-9', nameFr: 'Riz blanc cassé ou jasmin (pour servir)', nameEn: 'White broken rice or jasmine rice', quantity: 350, unitFr: 'g', order: 8 },
    ],
    steps: [
      { id: 's1-1', stepNumber: 1, instructionFr: "Émincez finement les oignons. Dans un grand saladier, mélangez le jus des citrons verts, la moutarde, l'ail écrasé, du sel, du poivre et 2 cuillères d'huile. Enrobez les morceaux de poulet et les oignons.", instructionEn: 'Thinly slice the onions. In a large bowl, whisk lime juice, mustard, crushed garlic, salt, pepper, and 2 tbsp of oil. Coat the chicken and onions thoroughly.', tipFr: "Massez bien la viande pour imprégner les fibres musculaires de l'acidité du citron.", tipEn: 'Massage the marinade into the meat so the citrus gently tenderizes the chicken.' },
      { id: 's1-2', stepNumber: 2, instructionFr: "Égouttez le poulet. Dans une cocotte ou poêle bien chaude, faites griller les cuisses de poulet jusqu'à obtenir une belle coloration dorée sur chaque face.", instructionEn: 'Drain chicken from marinade (keep the marinade and onions!). In a heavy pot, sear chicken over high heat until nicely browned on all sides.' },
      { id: 's1-3', stepNumber: 3, instructionFr: "Retirez le poulet et ajoutez les oignons égouttés dans la même cocotte. Faites-les suer à feu moyen pendant 15 minutes jusqu'à ce qu'ils deviennent tendres et translucides.", instructionEn: 'Remove chicken and add drained onions into the pot. Sauté over medium heat for 15 minutes until meltingly soft and lightly golden.' },
      { id: 's1-4', stepNumber: 4, instructionFr: 'Versez le reste de marinade, le laurier et remettez le poulet. Posez le piment entier sur le dessus sans le percer. Couvrez et laissez mijoter à feu doux 30 minutes.', instructionEn: 'Pour in the remaining marinade liquid and bay leaves, then return chicken. Rest the whole chili on top without puncturing it. Cover and simmer gently for 30 minutes.' },
      { id: 's1-5', stepNumber: 5, instructionFr: 'Retirez le couvercle 10 minutes avant la fin pour faire réduire la sauce aux oignons. Servez fumant avec du riz blanc bien chaud.', instructionEn: 'Uncover during the last 10 minutes to thicken the onion confit sauce. Serve piping hot over steamed fragrant white rice.' },
    ],
  },

  {
    id: 'rec-2',
    titleFr: 'Risotto Crémeux aux Champignons des Bois',
    titleEn: 'Creamy Wild Forest Mushroom Risotto',
    descriptionFr: "Riz Carnaroli nacré, cèpes sautés au beurre noisette, pointe d'échalote, vin blanc sec et généreux Parmesan Reggiano râpé à la minute.",
    descriptionEn: 'Silky Carnaroli rice slowly cooked with rich vegetable broth, sautéed wild porcini mushrooms, dry white wine, and 24-month aged Parmigiano Reggiano.',
    category: Category.vegetarian,
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: Difficulty.medium,
    imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true,
    isCustom: false,
    isPublic: true,
    chefNoteFr: 'La réussite du risotto réside dans la "mantecatura" finale : éteignez le feu avant d\'incorporer le beurre froid et le parmesan.',
    chefNoteEn: 'The secret is the final "mantecatura": take the pan off the heat before whipping in cold cubed butter and freshly grated Parmesan.',
    createdAt: new Date('2026-10-11T14:30:00.000Z'),
    tagsFr: ['Italie', 'Végétarien', 'Réconfort', 'Automne'],
    ingredients: [
      { id: 'i2-1', nameFr: 'Riz Carnaroli ou Arborio', nameEn: 'Carnaroli or Arborio rice', quantity: 320, unitFr: 'g', order: 0 },
      { id: 'i2-2', nameFr: 'Champignons des bois (cèpes, girolles)', nameEn: 'Wild mushrooms (porcini, chanterelles)', quantity: 350, unitFr: 'g', order: 1 },
      { id: 'i2-3', nameFr: 'Bouillon de légumes chaud', nameEn: 'Hot vegetable stock', quantity: 1, unitFr: 'Litre', order: 2 },
      { id: 'i2-4', nameFr: 'Échalotes françaises', nameEn: 'French shallots', quantity: 2, unitFr: 'pièces', order: 3 },
      { id: 'i2-5', nameFr: 'Vin blanc sec (type Sauvignon)', nameEn: 'Dry white wine', quantity: 120, unitFr: 'ml', order: 4 },
      { id: 'i2-6', nameFr: 'Parmigiano Reggiano AOP râpé', nameEn: 'Freshly grated Parmigiano Reggiano', quantity: 60, unitFr: 'g', order: 5 },
      { id: 'i2-7', nameFr: 'Beurre demi-sel froid en dés', nameEn: 'Cold salted butter (cubed)', quantity: 40, unitFr: 'g', order: 6 },
      { id: 'i2-8', nameFr: 'Persil plat frais', nameEn: 'Fresh flat-leaf parsley', quantity: 0.5, unitFr: 'botte', order: 7 },
    ],
    steps: [
      { id: 's2-1', stepNumber: 1, instructionFr: "Nettoyez les champignons délicatement avec un linge humide et coupez-les en morceaux. Faites-les sauter 5 minutes à feu vif avec une noisette de beurre et l'ail haché. Réservez.", instructionEn: 'Gently wipe mushrooms with a damp cloth and slice. Sauté 5 minutes over high heat with a dab of butter and garlic. Set aside.' },
      { id: 's2-2', stepNumber: 2, instructionFr: "Dans une sauteuse, faites suer les échalotes hachées avec un filet d'huile d'olive sans coloration. Versez le riz et remuez pendant 2 minutes pour le « nacrer ».", instructionEn: "In a wide sauté pan, sweat chopped shallots in olive oil without browning. Add rice and stir for 2 minutes until grains are translucent around edges." },
      { id: 's2-3', stepNumber: 3, instructionFr: "Déglacez avec le vin blanc et laissez évaporer l'alcool à feu moyen.", instructionEn: 'Deglaze with dry white wine and let alcohol evaporate completely over medium heat.' },
      { id: 's2-4', stepNumber: 4, instructionFr: 'Versez le bouillon frémissant louche par louche, en remuant doucement et en attendant que chaque louche soit absorbée avant d\'ajouter la suivante (environ 17 minutes).', instructionEn: 'Add hot simmering stock ladle by ladle, stirring continuously and waiting until absorbed before adding the next (approx. 17 minutes).' },
      { id: 's2-5', stepNumber: 5, instructionFr: 'Incorporez les champignons tièdes. Retirez la casserole du feu, ajoutez le beurre bien froid et le parmesan, couvrez 2 minutes puis fouettez vivement pour émulsionner.', instructionEn: "Fold in sautéed mushrooms. Take off heat, vigorously whip in cold butter and parmesan until ultra-creamy (all'onda), garnish with chopped parsley." },
    ],
  },

  {
    id: 'rec-3',
    titleFr: "Tarte Tatin Caramélisée à l'Ancienne",
    titleEn: 'Classic French Caramelized Tarte Tatin',
    descriptionFr: 'Le grand classique de la pâtisserie française : pommes fondantes lentement confites dans un caramel ambré au beurre salé, couronnées d\'un feuilletage croustillant.',
    descriptionEn: 'The quintessential French upside-down apple tart: golden apples gently poached in deep amber salted caramel underneath a flaky buttery puff pastry.',
    category: Category.dessert,
    prepTime: 30,
    cookTime: 40,
    servings: 6,
    difficulty: Difficulty.medium,
    imageUrl: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true,
    isCustom: false,
    isPublic: true,
    chefNoteFr: 'Utilisez des pommes qui tiennent bien à la cuisson comme la Reine des Reinettes, la Boskoop ou la Golden mûre.',
    chefNoteEn: 'Choose firm baking apples like Reine des Reinettes, Cox Orange, or Honeycrisp that retain their shape when caramelized.',
    createdAt: new Date('2026-10-12T09:15:00.000Z'),
    tagsFr: ['Pâtisserie', 'Pommes', 'Caramel', 'Tradition'],
    ingredients: [
      { id: 'i3-1', nameFr: 'Pommes reinettes ou gala', nameEn: 'Baking apples', quantity: 2, unitFr: 'kg', order: 0 },
      { id: 'i3-2', nameFr: 'Pâte feuilletée pur beurre', nameEn: 'All-butter puff pastry sheet', quantity: 1, unitFr: 'rouleau', order: 1 },
      { id: 'i3-3', nameFr: 'Sucre en poudre de canne', nameEn: 'Cane sugar', quantity: 160, unitFr: 'g', order: 2 },
      { id: 'i3-4', nameFr: 'Beurre demi-sel', nameEn: 'Salted butter', quantity: 90, unitFr: 'g', order: 3 },
      { id: 'i3-5', nameFr: 'Gousse de vanille de Madagascar', nameEn: 'Madagascar vanilla bean', quantity: 1, unitFr: 'gousse', order: 4 },
      { id: 'i3-6', nameFr: 'Crème fraîche épaisse fermière', nameEn: 'Farmhouse crème fraîche (for serving)', quantity: 200, unitFr: 'g', order: 5 },
    ],
    steps: [
      { id: 's3-1', stepNumber: 1, instructionFr: 'Épluchez les pommes, coupez-les en gros quartiers et évidez soigneusement le cœur.', instructionEn: 'Peel apples, cut them into generous quarters, and core carefully without breaking shapes.' },
      { id: 's3-2', stepNumber: 2, instructionFr: "Dans un moule à tatin ou poêle allant au four, faites fondre le sucre à sec jusqu'à obtenir un caramel blond ambré. Ajoutez le beurre en dés et les graines de vanille hors du feu.", instructionEn: 'In an oven-safe skillet or tatin mold, caramelize sugar until rich amber. Remove from heat and stir in butter and split vanilla seeds.' },
      { id: 's3-3', stepNumber: 3, instructionFr: 'Disposez les quartiers de pommes bien serrés verticalement sur le caramel. Laissez cuire sur la plaque 15 minutes à feu très doux pour que les pommes s\'imprègnent de jus.', instructionEn: 'Pack apple quarters tightly upright into the caramel. Simmer gently on stovetop for 15 minutes to let juices mingle with caramel.' },
      { id: 's3-4', stepNumber: 4, instructionFr: "Déposez le disque de pâte feuilletée par-dessus en rentrant les bords vers l'intérieur du moule. Piquez la pâte avec une fourchette.", instructionEn: 'Drape puff pastry over apples, tucking edges down inside the pan walls. Prick lightly with a fork.' },
      { id: 's3-5', stepNumber: 5, instructionFr: "Enfournez à 190°C pendant 35 minutes jusqu'à ce que la pâte soit bien dorée. Laissez tiédir 10 minutes avant de démouler d'un geste vif sur un plat.", instructionEn: 'Bake at 190°C (375°F) for 35 minutes until pastry is puffed and golden. Rest 10 minutes, then invert with one confident motion onto serving platter.' },
    ],
  },

  {
    id: 'rec-4',
    titleFr: 'Shakshuka Épicée aux Œufs Coulants',
    titleEn: 'Spiced Tomato & Pepper Shakshuka',
    descriptionFr: 'Poivrons rouges rôtis, tomates concassées parfumées au cumin et paprika fumé, œufs bio tout juste pochés dans la sauce et feta émiettée.',
    descriptionEn: 'Vibrant skillet dish with sweet red bell peppers, crushed tomatoes, smoked paprika, runny eggs, fresh coriander, and creamy feta cheese.',
    category: Category.breakfast,
    prepTime: 12,
    cookTime: 20,
    servings: 2,
    difficulty: Difficulty.easy,
    imageUrl: 'https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
    isCustom: false,
    isPublic: true,
    chefNoteFr: "Couvrez la poêle dès l'ajout des œufs et surveillez la cuisson : le blanc doit être pris et le jaune rester parfaitement liquide.",
    chefNoteEn: 'Cover the skillet right after cracking the eggs: watch closely until whites are barely set and yolks stay luscious and runny.',
    createdAt: new Date('2026-10-13T08:00:00.000Z'),
    tagsFr: ['Méditerranée', 'Brunch', 'Végétarien', 'Rapide'],
    ingredients: [
      { id: 'i4-1', nameFr: 'Œufs frais de ferme', nameEn: 'Fresh free-range eggs', quantity: 4, unitFr: 'pièces', order: 0 },
      { id: 'i4-2', nameFr: 'Poivrons rouges émincés', nameEn: 'Red bell peppers (sliced)', quantity: 2, unitFr: 'pièces', order: 1 },
      { id: 'i4-3', nameFr: 'Tomates concassées en purée', nameEn: 'Crushed peeled tomatoes', quantity: 400, unitFr: 'g', order: 2 },
      { id: 'i4-4', nameFr: 'Oignon rouge émincé', nameEn: 'Red onion (diced)', quantity: 1, unitFr: 'pièce', order: 3 },
      { id: 'i4-5', nameFr: 'Cumin moulu & paprika fumé', nameEn: 'Ground cumin & smoked paprika', quantity: 1.5, unitFr: 'c. à café', order: 4 },
      { id: 'i4-6', nameFr: 'Feta grecque AOP', nameEn: 'Greek Feta cheese', quantity: 70, unitFr: 'g', order: 5 },
      { id: 'i4-7', nameFr: 'Coriandre fraîche', nameEn: 'Fresh cilantro', quantity: 3, unitFr: 'brins', order: 6 },
      { id: 'i4-8', nameFr: 'Pain au levain grillé', nameEn: 'Crusty sourdough toast', quantity: 4, unitFr: 'tranches', order: 7 },
    ],
    steps: [
      { id: 's4-1', stepNumber: 1, instructionFr: "Faites chauffer l'huile d'olive dans une poêle en fonte. Faites revenir l'oignon et les poivrons 8 minutes jusqu'à ce qu'ils soient fondants.", instructionEn: 'Heat olive oil in a cast iron skillet. Sauté onions and bell peppers for 8 minutes until softened and fragrant.' },
      { id: 's4-2', stepNumber: 2, instructionFr: "Ajoutez les épices (cumin, paprika, piment doux) et l'ail haché. Remuez 1 minute pour libérer les arômes, puis versez les tomates concassées.", instructionEn: 'Stir in ground spices and minced garlic. Cook 1 minute until fragrant, then pour in crushed tomatoes.' },
      { id: 's4-3', stepNumber: 3, instructionFr: 'Laissez mijoter la sauce 10 minutes à feu doux pour qu\'elle épaississe. Creusez 4 petits puits avec une cuillère.', instructionEn: 'Simmer sauce 10 minutes over low heat until thickened. Form 4 small wells with the back of a spoon.' },
      { id: 's4-4', stepNumber: 4, instructionFr: 'Cassez un œuf dans chaque puits. Couvrez la poêle et laissez cuire 4 à 5 minutes à feu très doux.', instructionEn: 'Crack one egg into each well. Cover pan and cook gently for 4 to 5 minutes until egg whites solidify.' },
      { id: 's4-5', stepNumber: 5, instructionFr: "Parsemez de feta émiettée, de coriandre fraîche et de poivre du moulin. Dégustez directement dans la poêle avec le pain au levain.", instructionEn: 'Scatter crumbled feta, fresh cilantro leaves, and cracked pepper on top. Dip crusty sourdough straight into skillet.' },
    ],
  },

  {
    id: 'rec-5',
    titleFr: 'Velouté Dubarry Rôti & Noisettes Torréfiées',
    titleEn: 'Roasted Cauliflower Dubarry Soup & Hazelnuts',
    descriptionFr: "Une entrée raffinée à base de chou-fleur rôti au four pour intensifier ses saveurs de noisette, liée d'un trait de crème et d'éclats croustillants.",
    descriptionEn: 'An elegant French starter of golden roasted cauliflower pureed into a velvety potage, finished with toasted hazelnuts and truffle oil drops.',
    category: Category.starter,
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    difficulty: Difficulty.easy,
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
    isCustom: false,
    isPublic: true,
    chefNoteFr: "Rôtir le chou-fleur avant de le cuire dans le bouillon développe des notes toastées bien supérieures à une simple cuisson à l'eau.",
    chefNoteEn: 'Roasting cauliflower florets prior to simmering elevates the nutty caramel notes beyond boiling.',
    createdAt: new Date('2026-10-14T11:00:00.000Z'),
    tagsFr: ['Entrée', 'Soupe', 'Chou-fleur', 'Automne'],
    ingredients: [
      { id: 'i5-1', nameFr: 'Chou-fleur moyen', nameEn: 'Medium head of cauliflower', quantity: 1, unitFr: 'pièce', order: 0 },
      { id: 'i5-2', nameFr: 'Blanc de poireau', nameEn: 'Leek white part', quantity: 1, unitFr: 'pièce', order: 1 },
      { id: 'i5-3', nameFr: 'Bouillon de volaille ou légumes', nameEn: 'Vegetable or chicken broth', quantity: 800, unitFr: 'ml', order: 2 },
      { id: 'i5-4', nameFr: 'Crème fleurette entière', nameEn: 'Heavy cream', quantity: 100, unitFr: 'ml', order: 3 },
      { id: 'i5-5', nameFr: 'Noisettes concassées', nameEn: 'Crushed hazelnuts', quantity: 40, unitFr: 'g', order: 4 },
      { id: 'i5-6', nameFr: "Huile d'olive vierge extra", nameEn: 'Extra virgin olive oil', quantity: 2, unitFr: 'c. à soupe', order: 5 },
      { id: 'i5-7', nameFr: 'Muscade râpée', nameEn: 'Grated nutmeg', quantity: 1, unitFr: 'pincée', order: 6 },
    ],
    steps: [
      { id: 's5-1', stepNumber: 1, instructionFr: "Détaillez le chou-fleur en fleurettes. Mélangez avec de l'huile d'olive, du sel et enfournez à 200°C pendant 20 minutes pour les dorer.", instructionEn: 'Cut cauliflower into small florets. Toss with olive oil, salt, and roast at 200°C (400°F) for 20 minutes until golden brown.' },
      { id: 's5-2', stepNumber: 2, instructionFr: "Dans une casserole, faites suer le poireau émincé avec un peu de beurre. Ajoutez le chou-fleur rôti (gardez 4 petites fleurettes pour le décor).", instructionEn: 'In a pot, sweat sliced leek in butter. Add roasted cauliflower (reserve a few pretty florets for garnish).' },
      { id: 's5-3', stepNumber: 3, instructionFr: 'Versez le bouillon chaud à hauteur. Laissez frémir 10 minutes.', instructionEn: 'Cover with hot broth and simmer gently for 10 minutes until tender.' },
      { id: 's5-4', stepNumber: 4, instructionFr: 'Mixez au blender très finement avec la crème fleurette et la muscade jusqu\'à consistance soyeuse.', instructionEn: 'Puree in a high-speed blender with cream and a pinch of nutmeg until completely silky and velvety.' },
      { id: 's5-5', stepNumber: 5, instructionFr: 'Torréfiez les noisettes à sec dans une poêle. Versez le velouté dans des bols chauds et décorez des fleurettes réservées et des noisettes.', instructionEn: 'Dry toast crushed hazelnuts in a pan. Ladle hot soup into warm bowls and finish with reserved florets, toasted hazelnuts, and cracked pepper.' },
    ],
  },

  {
    id: 'rec-6',
    titleFr: 'Pain Rustique au Levain Maison',
    titleEn: 'Crusty Artisanal Sourdough Bread',
    descriptionFr: 'Une croûte chantante, bien dorée et caramélisée, abritant une mie alvéolée, moelleuse et légèrement acidulée au parfum de levain naturel.',
    descriptionEn: 'Handcrafted sourdough loaf featuring an open, custardy crumb and a blistered crust with rich fermented undertones.',
    category: Category.baking,
    prepTime: 40,
    cookTime: 45,
    servings: 8,
    difficulty: Difficulty.hard,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
    isCustom: false,
    isPublic: true,
    chefNoteFr: 'Une cocotte en fonte préchauffée à 240°C crée la vapeur idéale pour favoriser une expansion maximale du pâton.',
    chefNoteEn: 'A preheated cast iron Dutch oven creates the steam pocket necessary for majestic oven spring and crackling crust.',
    createdAt: new Date('2026-10-15T16:00:00.000Z'),
    tagsFr: ['Boulangerie', 'Fermentation', 'Levain', 'Tradition'],
    ingredients: [
      { id: 'i6-1', nameFr: 'Farine de blé T65 ou T80 biologique', nameEn: 'Organic strong bread flour', quantity: 500, unitFr: 'g', order: 0 },
      { id: 'i6-2', nameFr: 'Eau tempérée non chlorée (72%)', nameEn: 'Filtered water at room temp', quantity: 360, unitFr: 'ml', order: 1 },
      { id: 'i6-3', nameFr: 'Levain naturel actif et mousseux', nameEn: 'Active sourdough starter', quantity: 100, unitFr: 'g', order: 2 },
      { id: 'i6-4', nameFr: 'Sel fin marin de Guérande', nameEn: 'Fine sea salt', quantity: 10, unitFr: 'g', order: 3 },
    ],
    steps: [
      { id: 's6-1', stepNumber: 1, instructionFr: "Autolyse : mélangez la farine et l'eau grossièrement dans un bol. Couvrez et laissez reposer 45 minutes pour hydrater l'amidon.", instructionEn: "Autolyse: Mix flour and water in a bowl until no dry flour remains. Rest covered for 45 minutes." },
      { id: 's6-2', stepNumber: 2, instructionFr: "Ajoutez le levain actif et le sel. Pétrissez délicatement par étirements et replis (« slap & fold ») pendant 5 minutes.", instructionEn: 'Incorporate starter and salt. Perform gentle slap and fold stretches for 5 minutes until dough smooths out.' },
      { id: 's6-3', stepNumber: 3, instructionFr: 'Fermentation en vrac : effectuez 3 séries de rabats espacées de 30 minutes, puis laissez doubler de volume à 24°C pendant 3 à 4 heures.', instructionEn: 'Bulk fermentation: Perform 3 stretch-and-folds every 30 minutes, then let rise undisturbed for 3-4 hours.' },
      { id: 's6-4', stepNumber: 4, instructionFr: 'Façonnez en boule (boule) ou en ovale (bâtard) et placez dans un banneton fariné. Réservez 12 heures au réfrigérateur à 4°C.', instructionEn: 'Pre-shape and gently shape into a tight boule. Transfer seam-up into a floured banneton basket and cold ferment overnight.' },
      { id: 's6-5', stepNumber: 5, instructionFr: "Chauffez une cocotte en fonte à 240°C. Déposez le pâton froid, incisez d'un coup de lame net et cuisez 25 min avec couvercle, puis 20 min sans couvercle à 220°C.", instructionEn: 'Bake in preheated 240°C (465°F) Dutch oven with lid for 25 minutes, then uncover at 220°C for 20 minutes to develop dark golden crust.' },
    ],
  },

  {
    id: 'rec-7',
    titleFr: 'Salade César Authentique & Croûtons Dorés',
    titleEn: 'Classic Caesar Salad with Golden Croutons',
    descriptionFr: "Cœurs de romaine croquants enrobés d'une émulsion crémeuse anchois-parmesan, suprêmes de poulet grillés et croûtons frottés à l'ail.",
    descriptionEn: 'Crispy romaine hearts coated in a rich house-made anchovy and Parmesan dressing, topped with seared chicken breast and garlic brioche croutons.',
    category: Category.starter,
    prepTime: 20,
    cookTime: 10,
    servings: 4,
    difficulty: Difficulty.easy,
    imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=1200&q=80',
    isFeatured: false,
    isCustom: false,
    isPublic: true,
    chefNoteFr: "Ne zappez pas les anchois dans la sauce : ils fondent complètement et apportent le goût umami inimitable de la vraie recette.",
    chefNoteEn: 'Do not skip the anchovies in the dressing: they dissolve and provide the signature savory umami kick.',
    createdAt: new Date('2026-10-16T12:00:00.000Z'),
    tagsFr: ['Salade', 'Classique', 'Fraîcheur', 'Volaille'],
    ingredients: [
      { id: 'i7-1', nameFr: 'Cœurs de salade romaine lavés', nameEn: 'Romaine lettuce hearts', quantity: 3, unitFr: 'pièces', order: 0 },
      { id: 'i7-2', nameFr: 'Blancs de poulet fermier', nameEn: 'Free-range chicken breasts', quantity: 2, unitFr: 'pièces', order: 1 },
      { id: 'i7-3', nameFr: "Filets d'anchois à l'huile", nameEn: 'Anchovy fillets in oil', quantity: 4, unitFr: 'filets', order: 2 },
      { id: 'i7-4', nameFr: "Jaune d'œuf extra frais", nameEn: 'Fresh egg yolk', quantity: 1, unitFr: 'pièce', order: 3 },
      { id: 'i7-5', nameFr: 'Copeaux de Parmigiano Reggiano', nameEn: 'Shaved Parmigiano Reggiano', quantity: 50, unitFr: 'g', order: 4 },
      { id: 'i7-6', nameFr: 'Moutarde de Dijon & Worcestershire', nameEn: 'Dijon mustard & Worcestershire', quantity: 1, unitFr: 'c. à café', order: 5 },
      { id: 'i7-7', nameFr: 'Pain de campagne pour croûtons', nameEn: 'Rustic sourdough bread for croutons', quantity: 150, unitFr: 'g', order: 6 },
      { id: 'i7-8', nameFr: "Huile d'olive et jus de citron", nameEn: 'Olive oil & lemon juice', quantity: 3, unitFr: 'c. à soupe', order: 7 },
    ],
    steps: [
      { id: 's7-1', stepNumber: 1, instructionFr: "Coupez le pain en dés. Faites-les dorer dans une poêle avec de l'huile d'olive et une gousse d'ail écrasée jusqu'à ce qu'ils soient croustillants.", instructionEn: 'Cube bread and toss in a skillet with olive oil and crushed garlic until crisp and golden brown.' },
      { id: 's7-2', stepNumber: 2, instructionFr: "Faites griller les blancs de poulet assaisonnés 5 minutes de chaque côté. Laissez reposer 5 minutes puis tranchez-les en biseaux.", instructionEn: 'Sear seasoned chicken breasts 5 minutes per side until cooked through. Rest 5 minutes then slice on a bias.' },
      { id: 's7-3', stepNumber: 3, instructionFr: "Préparez la sauce : émulsionnez au mortier ou fouet le jaune d'œuf, la moutarde, les anchois écrasés, le jus de citron et montez à l'huile d'olive.", instructionEn: 'Prepare dressing: crush anchovies into paste, whisk with egg yolk, mustard, lemon juice, Worcestershire, and slowly emulsify with olive oil.' },
      { id: 's7-4', stepNumber: 4, instructionFr: "Mélangez la romaine effeuillée avec la sauce pour bien l'enrober sans l'écraser.", instructionEn: 'Gently toss crisp torn romaine leaves with dressing to coat evenly.' },
      { id: 's7-5', stepNumber: 5, instructionFr: "Dressez dans de grands plats creux avec les tranches de poulet tièdes, les croûtons et de généreux copeaux de parmesan.", instructionEn: 'Assemble in wide salad bowls with sliced warm chicken, crunchy croutons, and generous shavings of aged parmesan.' },
    ],
  },

  {
    id: 'rec-8',
    titleFr: 'Moelleux au Chocolat Noir Cœur Coulant',
    titleEn: 'Molten Lava Dark Chocolate Fondant',
    descriptionFr: 'Une croûte fine et craquelée cachant un torrent chocolaté intense à 70% de cacao, à savourer dès la sortie du four.',
    descriptionEn: 'Intense 70% dark chocolate lava cakes featuring a delicate exterior that yields to a warm, velvety liquid chocolate center.',
    category: Category.dessert,
    prepTime: 15,
    cookTime: 9,
    servings: 4,
    difficulty: Difficulty.easy,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80',
    isFeatured: true,
    isCustom: false,
    isPublic: true,
    chefNoteFr: 'La cuisson est le moment clé à la seconde près : le pourtour doit être cuit et le centre encore frémissant.',
    chefNoteEn: 'Timing is everything: pull them from the oven the second the outer rim is set while the center remains trembly.',
    createdAt: new Date('2026-10-17T15:20:00.000Z'),
    tagsFr: ['Chocolat', 'Dessert', 'Gourmand', 'Express'],
    ingredients: [
      { id: 'i8-1', nameFr: 'Chocolat noir pâtissier 70% de cacao', nameEn: '70% Valrhona or dark baking chocolate', quantity: 150, unitFr: 'g', order: 0 },
      { id: 'i8-2', nameFr: 'Beurre doux', nameEn: 'Unsalted butter', quantity: 100, unitFr: 'g', order: 1 },
      { id: 'i8-3', nameFr: 'Œufs entiers à température ambiante', nameEn: 'Large whole eggs (room temp)', quantity: 3, unitFr: 'pièces', order: 2 },
      { id: 'i8-4', nameFr: 'Sucre de canne blond', nameEn: 'Golden caster sugar', quantity: 60, unitFr: 'g', order: 3 },
      { id: 'i8-5', nameFr: 'Farine de blé tamisée', nameEn: 'Sifted all-purpose flour', quantity: 45, unitFr: 'g', order: 4 },
      { id: 'i8-6', nameFr: 'Fleur de sel', nameEn: 'Flaky sea salt', quantity: 1, unitFr: 'pincée', order: 5 },
    ],
    steps: [
      { id: 's8-1', stepNumber: 1, instructionFr: 'Préchauffez votre four à 200°C (chaleur tournante). Beurrez 4 ramequins et saupoudrez-les d\'un voile de cacao en poudre.', instructionEn: 'Preheat oven to 200°C (400°F). Generously butter 4 ramekins and dust inside with unsweetened cocoa powder.' },
      { id: 's8-2', stepNumber: 2, instructionFr: 'Faites fondre le chocolat cassé en morceaux avec le beurre au bain-marie doux jusqu\'à consistance lisse.', instructionEn: 'Melt chopped chocolate and butter in a heatproof bowl over a gentle water bath until smooth and glossy.' },
      { id: 's8-3', stepNumber: 3, instructionFr: "Dans un autre bol, fouettez les œufs entiers avec le sucre jusqu'à ce que le mélange blanchisse légèrement. Incorporez le chocolat tiédi.", instructionEn: 'In a separate bowl, whisk eggs and sugar until pale. Slowly fold in lukewarm melted chocolate mixture.' },
      { id: 's8-4', stepNumber: 4, instructionFr: 'Ajoutez la farine tamisée et la fleur de sel. Mélangez à la spatule sans trop travailler la pâte. Répartissez dans les ramequins.', instructionEn: 'Sift in flour and sea salt. Fold with a silicone spatula just until combined. Divide evenly among ramekins.' },
      { id: 's8-5', stepNumber: 5, instructionFr: 'Enfournez exactement 9 à 10 minutes. Laissez reposer 2 minutes puis passez une lame fine pour démouler sur les assiettes.', instructionEn: 'Bake for exactly 9 to 10 minutes. Rest 2 minutes, run a thin knife along edges, and unmold gently onto dessert plates.' },
    ],
  },
];

async function main() {
  console.log('🌱 Démarrage du seed Recipe Box...\n');

  console.log(`📌 Création/vérification de ${TAG_CATALOG.length} tags...`);
  for (const tag of TAG_CATALOG) {
    await prisma.tag.upsert({
      where: { nameFr: tag.nameFr },
      create: { nameFr: tag.nameFr, nameEn: tag.nameEn },
      update: {},
    });
  }

  for (const recipe of SEED_RECIPES) {
    const { ingredients, steps, tagsFr, ...recipeData } = recipe;

    console.log(`\n🍽️  Traitement : ${recipeData.titleFr} (${recipeData.id})`);

    await prisma.recipe.upsert({
      where: { id: recipeData.id },
      create: recipeData,
      update: {
        titleFr: recipeData.titleFr,
        titleEn: recipeData.titleEn,
        descriptionFr: recipeData.descriptionFr,
        descriptionEn: recipeData.descriptionEn,
        category: recipeData.category,
        prepTime: recipeData.prepTime,
        cookTime: recipeData.cookTime,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        imageUrl: recipeData.imageUrl,
        isFeatured: recipeData.isFeatured,
        chefNoteFr: recipeData.chefNoteFr,
        chefNoteEn: recipeData.chefNoteEn,
      },
    });

    await prisma.ingredient.deleteMany({ where: { recipeId: recipeData.id } });
    await prisma.ingredient.createMany({
      data: ingredients.map((ing) => ({
        ...ing,
        recipeId: recipeData.id,
      })),
    });
    console.log(`   ✓ ${ingredients.length} ingrédients`);

    await prisma.recipeStep.deleteMany({ where: { recipeId: recipeData.id } });
    await prisma.recipeStep.createMany({
      data: steps.map((step) => ({
        ...step,
        recipeId: recipeData.id,
      })),
    });
    console.log(`   ✓ ${steps.length} étapes`);

    await prisma.recipeTag.deleteMany({ where: { recipeId: recipeData.id } });
    for (const tagFr of tagsFr) {
      const tag = await prisma.tag.findUnique({ where: { nameFr: tagFr } });
      if (tag) {
        await prisma.recipeTag.create({
          data: { recipeId: recipeData.id, tagId: tag.id },
        });
      } else {
        console.warn(`   ⚠ Tag introuvable : "${tagFr}"`);
      }
    }
    console.log(`   ✓ ${tagsFr.length} tags liés`);
  }

  console.log('\n✅ Seed terminé avec succès !');
  console.log(`   ${SEED_RECIPES.length} recettes insérées ou mises à jour.`);
  console.log(`   ${TAG_CATALOG.length} tags créés ou vérifiés.`);
}

main()
  .catch((err) => {
    console.error('❌ Erreur lors du seed :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
