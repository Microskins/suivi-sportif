import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedPath = path.join(__dirname, 'exercises.seed.json');
const outputDir = path.join(__dirname, 'prompts');

const exercises = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

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

const formatList = (items) => items.map((item) => `- ${item.toLowerCase()}`).join('\n');

const createPrompt = (exercise) => `Créer une fiche d’exercice de musculation professionnelle en français au format infographie fitness moderne sur fond blanc.

Style :
- design premium type application fitness professionnelle
- mise en page très propre et structurée
- style médical/sport moderne
- rendu ultra net HD
- couleurs sobres : blanc, noir, gris, bleu foncé
- muscles travaillés colorés en rouge/orange
- illustrations réalistes semi-3D
- aucune marque, aucun logo, aucun watermark

Contenu :
- grand titre en haut : ${exercise.title.toUpperCase()}
- section type d’exercice
- section mécanique
- section matériel
- section difficulté
- section exécution avec étapes numérotées
- schéma anatomique face/dos
- muscles principaux colorés
- position de départ
- fin du mouvement
- conseils
- variantes
- muscles secondaires

Informations exercice :
Type : ${exercise.type}
Mécanique : ${exercise.mechanic}
Matériel : ${exercise.equipment.join(', ')}
Difficulté : ${exercise.difficulty}

Muscles principaux :
${formatList(exercise.primaryMuscles)}

Muscles secondaires :
${formatList(exercise.secondaryMuscles)}

Variantes :
${formatList(exercise.variants)}

Conseils :
${formatList(exercise.tips)}
`;

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const exercise of exercises) {
  const category = exercise.category ?? 'autres';
  const categoryDir = path.join(outputDir, category);
  const fileName = `${exercise.id ?? normalize(exercise.title)}.txt`;
  const filePath = path.join(categoryDir, fileName);

  fs.mkdirSync(categoryDir, { recursive: true });
  fs.writeFileSync(filePath, createPrompt(exercise), 'utf8');
}

console.log(`Generated ${exercises.length} prompts in ${path.relative(process.cwd(), outputDir)}`);
