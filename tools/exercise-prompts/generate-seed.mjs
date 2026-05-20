import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, 'exercises.input.json');
const outputPath = path.join(__dirname, 'exercises.seed.json');

const rawExercises = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const normalize = (value) =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const splitEquipment = (value) =>
  value
    .split('/')
    .map((item) => item.trim())
    .filter(Boolean);

const categoryMap = {
  'Pectoraux': 'pectoraux',
  'Dos': 'dos',
  'Épaules': 'epaules',
  'Biceps': 'biceps',
  'Triceps': 'triceps',
  'Jambes — quadriceps': 'jambes-quadriceps',
  'Jambes — ischios / fessiers': 'jambes-ischios-fessiers',
  'Mollets': 'mollets',
  'Abdos / gainage': 'abdos-gainage',
  'Avant-bras / grip': 'avant-bras-grip',
  'Full body / fonctionnel': 'full-body-fonctionnel',
  'Cardio / HIIT': 'cardio-hiit',
};

const defaultTips = [
  'Gardez une posture stable et contrôlée',
  'Respirez de façon régulière pendant le mouvement',
  'Privilégiez une exécution propre plutôt qu’une charge trop lourde',
];

const rules = [
  {
    test: /développé couché|chest press/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Pectoraux'],
    secondaryMuscles: ['Triceps', 'Deltoïdes antérieurs'],
  },
  {
    test: /incliné/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Pectoraux supérieurs', 'Triceps', 'Deltoïdes antérieurs'],
    secondaryMuscles: ['Dentelé antérieur'],
  },
  {
    test: /décliné|dips buste/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Pectoraux inférieurs', 'Triceps'],
    secondaryMuscles: ['Deltoïdes antérieurs'],
  },
  {
    test: /pompes diamant/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Triceps', 'Pectoraux'],
    secondaryMuscles: ['Deltoïdes antérieurs', 'Abdominaux'],
  },
  {
    test: /pompes/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Pectoraux'],
    secondaryMuscles: ['Triceps', 'Deltoïdes antérieurs'],
  },
  {
    test: /écarté|pec deck/i,
    type: 'Force',
    mechanic: 'Isolation',
    primaryMuscles: ['Pectoraux'],
    secondaryMuscles: ['Deltoïdes antérieurs'],
  },
  {
    test: /pull-over/i,
    type: 'Force',
    mechanic: 'Isolation',
    primaryMuscles: ['Grand dorsal', 'Pectoraux'],
    secondaryMuscles: ['Triceps long', 'Dentelé antérieur'],
  },
  {
    test: /traction|tirage vertical/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Grand dorsal', 'Biceps'],
    secondaryMuscles: ['Rhomboïdes', 'Trapèzes', 'Avant-bras'],
  },
  {
    test: /rowing|renegade row/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Grand dorsal', 'Rhomboïdes', 'Trapèzes'],
    secondaryMuscles: ['Biceps', 'Deltoïdes postérieurs', 'Avant-bras'],
  },
  {
    test: /soulevé de terre roumain|jambes tendues|good morning/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Ischio-jambiers', 'Fessiers'],
    secondaryMuscles: ['Lombaires', 'Adducteurs', 'Abdominaux'],
  },
  {
    test: /soulevé de terre$/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Chaîne postérieure', 'Fessiers', 'Ischio-jambiers'],
    secondaryMuscles: ['Lombaires', 'Trapèzes', 'Avant-bras', 'Abdominaux'],
  },
  {
    test: /extensions lombaires|superman/i,
    type: 'Renforcement',
    mechanic: 'Isolation',
    primaryMuscles: ['Lombaires'],
    secondaryMuscles: ['Fessiers', 'Ischio-jambiers'],
  },
  {
    test: /face pull/i,
    type: 'Renforcement',
    mechanic: 'Isolation',
    primaryMuscles: ['Deltoïdes postérieurs', 'Trapèzes moyens'],
    secondaryMuscles: ['Rhomboïdes', 'Rotateurs externes'],
  },
  {
    test: /shrugs/i,
    type: 'Force',
    mechanic: 'Isolation',
    primaryMuscles: ['Trapèzes supérieurs'],
    secondaryMuscles: ['Avant-bras'],
  },
  {
    test: /développé militaire|développé épaules|shoulder press|arnold press/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Deltoïdes antérieurs', 'Deltoïdes moyens'],
    secondaryMuscles: ['Triceps', 'Trapèzes'],
  },
  {
    test: /élévations latérales/i,
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Deltoïdes moyens'],
    secondaryMuscles: ['Trapèzes supérieurs'],
  },
  {
    test: /élévations frontales/i,
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Deltoïdes antérieurs'],
    secondaryMuscles: ['Pectoraux supérieurs'],
  },
  {
    test: /oiseau|reverse pec deck/i,
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Deltoïdes postérieurs'],
    secondaryMuscles: ['Trapèzes moyens', 'Rhomboïdes'],
  },
  {
    test: /upright row/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Deltoïdes moyens', 'Trapèzes'],
    secondaryMuscles: ['Biceps'],
  },
  {
    test: /pike push-up|handstand push-up/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Épaules', 'Triceps'],
    secondaryMuscles: ['Pectoraux supérieurs', 'Abdominaux'],
  },
  {
    test: /cuban press|rotation externe/i,
    type: 'Prévention',
    mechanic: 'Isolation',
    primaryMuscles: ['Coiffe des rotateurs'],
    secondaryMuscles: ['Deltoïdes postérieurs'],
  },
  {
    test: /curl/i,
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Biceps brachial', 'Brachial antérieur'],
    secondaryMuscles: ['Avant-bras'],
  },
  {
    test: /extension triceps|barre au front|kickback|tate press/i,
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Avant-bras'],
  },
  {
    test: /dips triceps|prise serrée/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Pectoraux', 'Deltoïdes antérieurs'],
  },
  {
    test: /squat|presse à cuisses|hack squat|fentes|step-up|wall sit|chaise|pistol/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Quadriceps', 'Fessiers'],
    secondaryMuscles: ['Ischio-jambiers', 'Mollets', 'Abdominaux'],
  },
  {
    test: /leg extension|sissy squat/i,
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Fléchisseurs de hanche'],
  },
  {
    test: /hip thrust|glute bridge|pull-through|kickback|donkey kicks|fire hydrants|abduction/i,
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Fessiers'],
    secondaryMuscles: ['Ischio-jambiers', 'Abdominaux'],
  },
  {
    test: /leg curl|nordic curl/i,
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Ischio-jambiers'],
    secondaryMuscles: ['Mollets'],
  },
  {
    test: /kettlebell swing/i,
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Fessiers', 'Ischio-jambiers'],
    secondaryMuscles: ['Lombaires', 'Abdominaux', 'Épaules'],
  },
  {
    test: /mollets|calf|pointes/i,
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Mollets'],
    secondaryMuscles: ['Soléaire', 'Tibial postérieur'],
  },
  {
    test: /crunch|reverse crunch|sit-up|relevé de jambes|relevé de genoux/i,
    type: 'Renforcement',
    mechanic: 'Isolation',
    primaryMuscles: ['Grand droit'],
    secondaryMuscles: ['Fléchisseurs de hanche', 'Obliques'],
  },
  {
    test: /planche|gainage|dead bug|hollow hold|pallof|ab wheel/i,
    type: 'Renforcement',
    mechanic: 'Isométrique',
    primaryMuscles: ['Transverse', 'Grand droit', 'Obliques'],
    secondaryMuscles: ['Fessiers', 'Lombaires', 'Épaules'],
  },
  {
    test: /mountain climbers|russian twist|woodchopper/i,
    type: 'Renforcement',
    mechanic: 'Fonctionnel',
    primaryMuscles: ['Obliques', 'Grand droit'],
    secondaryMuscles: ['Transverse', 'Fléchisseurs de hanche'],
  },
  {
    test: /farmer walk|dead hang|plate pinch|wrist roller|poignets/i,
    type: 'Renforcement',
    mechanic: 'Isolation',
    primaryMuscles: ['Avant-bras', 'Grip'],
    secondaryMuscles: ['Biceps', 'Trapèzes'],
  },
  {
    test: /burpees|thruster|clean and press|turkish get-up|sled push|battle rope|med ball slam|bear crawl|jumping jacks/i,
    type: 'Conditionnement',
    mechanic: 'Fonctionnel',
    primaryMuscles: ['Chaîne postérieure', 'Quadriceps', 'Épaules'],
    secondaryMuscles: ['Abdominaux', 'Fessiers', 'Dos'],
  },
  {
    test: /course|vélo|rameur|elliptique|assault bike|corde à sauter|sprint|montées de genoux|shadow boxing/i,
    type: 'Cardio / HIIT',
    mechanic: 'Cardio',
    primaryMuscles: ['Système cardiovasculaire'],
    secondaryMuscles: ['Quadriceps', 'Fessiers', 'Mollets', 'Abdominaux'],
  },
];

const fallbackByCategory = {
  pectoraux: {
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Pectoraux'],
    secondaryMuscles: ['Triceps', 'Deltoïdes antérieurs'],
  },
  dos: {
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Grand dorsal', 'Trapèzes'],
    secondaryMuscles: ['Biceps', 'Rhomboïdes', 'Avant-bras'],
  },
  epaules: {
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Deltoïdes'],
    secondaryMuscles: ['Trapèzes'],
  },
  biceps: {
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Biceps brachial'],
    secondaryMuscles: ['Avant-bras'],
  },
  triceps: {
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Triceps'],
    secondaryMuscles: ['Avant-bras'],
  },
  'jambes-quadriceps': {
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Quadriceps'],
    secondaryMuscles: ['Fessiers', 'Ischio-jambiers'],
  },
  'jambes-ischios-fessiers': {
    type: 'Force',
    mechanic: 'Polyarticulaire',
    primaryMuscles: ['Ischio-jambiers', 'Fessiers'],
    secondaryMuscles: ['Lombaires', 'Abdominaux'],
  },
  mollets: {
    type: 'Hypertrophie',
    mechanic: 'Isolation',
    primaryMuscles: ['Mollets'],
    secondaryMuscles: ['Soléaire'],
  },
  'abdos-gainage': {
    type: 'Renforcement',
    mechanic: 'Isométrique',
    primaryMuscles: ['Grand droit', 'Transverse', 'Obliques'],
    secondaryMuscles: ['Lombaires'],
  },
  'avant-bras-grip': {
    type: 'Renforcement',
    mechanic: 'Isolation',
    primaryMuscles: ['Avant-bras', 'Grip'],
    secondaryMuscles: ['Biceps'],
  },
  'full-body-fonctionnel': {
    type: 'Conditionnement',
    mechanic: 'Fonctionnel',
    primaryMuscles: ['Corps entier'],
    secondaryMuscles: ['Abdominaux', 'Fessiers', 'Épaules'],
  },
  'cardio-hiit': {
    type: 'Cardio / HIIT',
    mechanic: 'Cardio',
    primaryMuscles: ['Système cardiovasculaire'],
    secondaryMuscles: ['Quadriceps', 'Fessiers', 'Mollets'],
  },
};

const findRule = (name) => rules.find((rule) => rule.test.test(name));

const findVariants = (exercise, allExercises) => {
  const baseSlug = normalize(exercise.name);
  const category = exercise.categoryLabel;
  const sameCategory = allExercises
    .filter((item) => item.categoryLabel === category && normalize(item.name) !== baseSlug)
    .map((item) => item.name);

  const words = baseSlug.split('-').filter((word) => word.length > 3);
  const related = sameCategory.filter((name) => {
    const slug = normalize(name);
    return words.some((word) => slug.includes(word));
  });

  return [...new Set([...related, ...sameCategory])].slice(0, 3);
};

const exercises = rawExercises.map((exercise) => {
  const category = categoryMap[exercise.categoryLabel] ?? normalize(exercise.categoryLabel);
  const rule = findRule(exercise.name) ?? fallbackByCategory[category];

  return {
    id: normalize(exercise.name),
    category,
    title: exercise.name,
    type: rule.type,
    mechanic: rule.mechanic,
    equipment: splitEquipment(exercise.equipmentLabel),
    difficulty: exercise.difficulty,
    primaryMuscles: rule.primaryMuscles,
    secondaryMuscles: rule.secondaryMuscles,
    variants: findVariants(exercise, rawExercises),
    tips: defaultTips,
  };
});

fs.writeFileSync(outputPath, `${JSON.stringify(exercises, null, 2)}\n`, 'utf8');

console.log(`Generated ${exercises.length} exercises in ${path.relative(process.cwd(), outputPath)}`);
