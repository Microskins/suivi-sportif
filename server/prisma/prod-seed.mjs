import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.SEED_ACCOUNT_EMAIL || "admin@suivi-sportif.fr";
const ADMIN_NAME = process.env.SEED_ACCOUNT_NAME || "Admin Test";
const PASSWORD_SALT_ROUNDS = 10;

const generatedPassword = !process.env.SEED_ACCOUNT_PASSWORD;
const adminPassword =
  process.env.SEED_ACCOUNT_PASSWORD || randomBytes(18).toString("base64url");

const exercises = [
  {
    name: "ï¿½cartï¿½ ï¿½ la poulie",
    description: "ï¿½cartï¿½ ï¿½ la poulie est un exercice de pectoraux rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "ï¿½cartï¿½ couchï¿½ haltï¿½res",
    description: "ï¿½cartï¿½ couchï¿½ haltï¿½res est un exercice de pectoraux rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "ï¿½cartï¿½ inclinï¿½ haltï¿½res",
    description: "ï¿½cartï¿½ inclinï¿½ haltï¿½res est un exercice de pectoraux rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "ï¿½lï¿½vations frontales",
    description: "ï¿½lï¿½vations frontales est un exercice d'ï¿½paules rï¿½alisï¿½ avec haltï¿½res / disque. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "ï¿½lï¿½vations latï¿½rales",
    description: "ï¿½lï¿½vations latï¿½rales est un exercice d'ï¿½paules rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "ï¿½lï¿½vations latï¿½rales poulie",
    description: "ï¿½lï¿½vations latï¿½rales poulie est un exercice d'ï¿½paules rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Ab wheel rollout",
    description: "Ab wheel rollout est un exercice d'abdos / gainage rï¿½alisï¿½ avec roue abdominale. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Abduction hanche machine",
    description: "Abduction hanche machine est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Arnold press",
    description: "Arnold press est un exercice d'ï¿½paules rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Assault bike",
    description: "Assault bike est un exercice de cardio / hiit rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "CARDIO",
  },
  {
    name: "Barre au front",
    description: "Barre au front est un exercice de triceps rï¿½alisï¿½ avec barre ez. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Battle rope",
    description: "Battle rope est un exercice de full body / fonctionnel rï¿½alisï¿½ avec cordes. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Bear crawl",
    description: "Bear crawl est un exercice de full body / fonctionnel rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Burpees",
    description: "Burpees est un exercice de full body / fonctionnel rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Chest press",
    description: "Chest press est un exercice de pectoraux rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Clean and press",
    description: "Clean and press est un exercice de full body / fonctionnel rï¿½alisï¿½ avec barre / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ avancï¿½.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Corde ï¿½ sauter",
    description: "Corde ï¿½ sauter est un exercice de cardio / hiit rï¿½alisï¿½ avec corde. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Course tapis",
    description: "Course tapis est un exercice de cardio / hiit rï¿½alisï¿½ avec tapis. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Crunch",
    description: "Crunch est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Crunch poulie haute",
    description: "Crunch poulie haute est un exercice d'abdos / gainage rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Cuban press",
    description: "Cuban press est un exercice d'ï¿½paules rï¿½alisï¿½ avec haltï¿½res lï¿½gers. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl barre droite",
    description: "Curl barre droite est un exercice de biceps rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl barre EZ",
    description: "Curl barre EZ est un exercice de biceps rï¿½alisï¿½ avec barre ez. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl cï¿½ble unilatï¿½ral",
    description: "Curl cï¿½ble unilatï¿½ral est un exercice de biceps rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl concentration",
    description: "Curl concentration est un exercice de biceps rï¿½alisï¿½ avec haltï¿½re. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl haltï¿½res alternï¿½",
    description: "Curl haltï¿½res alternï¿½ est un exercice de biceps rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl inclinï¿½",
    description: "Curl inclinï¿½ est un exercice de biceps rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl inversï¿½",
    description: "Curl inversï¿½ est un exercice de biceps rï¿½alisï¿½ avec barre / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl marteau",
    description: "Curl marteau est un exercice de biceps rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl poignets",
    description: "Curl poignets est un exercice de avant-bras / grip rï¿½alisï¿½ avec barre / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl poignets inversï¿½",
    description: "Curl poignets inversï¿½ est un exercice de avant-bras / grip rï¿½alisï¿½ avec barre / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl poulie basse",
    description: "Curl poulie basse est un exercice de biceps rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl pupitre",
    description: "Curl pupitre est un exercice de biceps rï¿½alisï¿½ avec barre / machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl spider",
    description: "Curl spider est un exercice de biceps rï¿½alisï¿½ avec barre / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl Zottman",
    description: "Curl Zottman est un exercice de biceps rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dead bug",
    description: "Dead bug est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dead hang",
    description: "Dead hang est un exercice de avant-bras / grip rï¿½alisï¿½ avec barre de traction. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dï¿½veloppï¿½ couchï¿½",
    description: "Dï¿½veloppï¿½ couchï¿½ est un exercice de pectoraux rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dï¿½veloppï¿½ couchï¿½ haltï¿½res",
    description: "Dï¿½veloppï¿½ couchï¿½ haltï¿½res est un exercice de pectoraux rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dï¿½veloppï¿½ couchï¿½ prise serrï¿½e",
    description: "Dï¿½veloppï¿½ couchï¿½ prise serrï¿½e est un exercice de triceps rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dï¿½veloppï¿½ dï¿½clinï¿½",
    description: "Dï¿½veloppï¿½ dï¿½clinï¿½ est un exercice de pectoraux rï¿½alisï¿½ avec barre / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dï¿½veloppï¿½ ï¿½paules haltï¿½res",
    description: "Dï¿½veloppï¿½ ï¿½paules haltï¿½res est un exercice d'ï¿½paules rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dï¿½veloppï¿½ inclinï¿½ barre",
    description: "Dï¿½veloppï¿½ inclinï¿½ barre est un exercice de pectoraux rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dï¿½veloppï¿½ inclinï¿½ haltï¿½res",
    description: "Dï¿½veloppï¿½ inclinï¿½ haltï¿½res est un exercice de pectoraux rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dï¿½veloppï¿½ militaire",
    description: "Dï¿½veloppï¿½ militaire est un exercice d'ï¿½paules rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dips buste penchï¿½",
    description: "Dips buste penchï¿½ est un exercice de pectoraux rï¿½alisï¿½ avec barres parallï¿½les. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dips triceps",
    description: "Dips triceps est un exercice de triceps rï¿½alisï¿½ avec banc / barres. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Donkey calf raise",
    description: "Donkey calf raise est un exercice de mollets rï¿½alisï¿½ avec machine / partenaire. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Donkey kicks",
    description: "Donkey kicks est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension nuque barre EZ",
    description: "Extension nuque barre EZ est un exercice de triceps rï¿½alisï¿½ avec barre ez. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension nuque haltï¿½re",
    description: "Extension nuque haltï¿½re est un exercice de triceps rï¿½alisï¿½ avec haltï¿½re. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension triceps au-dessus de la tï¿½te poulie",
    description: "Extension triceps au-dessus de la tï¿½te poulie est un exercice de triceps rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension triceps poulie barre",
    description: "Extension triceps poulie barre est un exercice de triceps rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension triceps poulie corde",
    description: "Extension triceps poulie corde est un exercice de triceps rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension triceps unilatï¿½rale",
    description: "Extension triceps unilatï¿½rale est un exercice de triceps rï¿½alisï¿½ avec poulie / haltï¿½re. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extensions lombaires",
    description: "Extensions lombaires est un exercice de dos rï¿½alisï¿½ avec banc lombaire. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Face pull",
    description: "Face pull est un exercice de dos rï¿½alisï¿½ avec poulie / ï¿½lastique. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Farmer walk",
    description: "Farmer walk est un exercice de avant-bras / grip rï¿½alisï¿½ avec haltï¿½res / kettlebells. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Farmer walk sur pointes",
    description: "Farmer walk sur pointes est un exercice de mollets rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Fentes arriï¿½re",
    description: "Fentes arriï¿½re est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec poids du corps / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Fentes avant",
    description: "Fentes avant est un exercice de jambes - quadriceps rï¿½alisï¿½ avec poids du corps / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Fentes bulgares",
    description: "Fentes bulgares est un exercice de jambes - quadriceps rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Fentes marchï¿½es",
    description: "Fentes marchï¿½es est un exercice de jambes - quadriceps rï¿½alisï¿½ avec poids du corps / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Fire hydrants",
    description: "Fire hydrants est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Gainage Superman",
    description: "Gainage Superman est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Glute bridge",
    description: "Glute bridge est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec poids du corps / barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Goblet squat",
    description: "Goblet squat est un exercice de jambes - quadriceps rï¿½alisï¿½ avec haltï¿½re / kettlebell. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Good morning",
    description: "Good morning est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ avancï¿½.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Hack squat",
    description: "Hack squat est un exercice de jambes - quadriceps rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Handstand push-up",
    description: "Handstand push-up est un exercice d'ï¿½paules rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ avancï¿½.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Hip thrust",
    description: "Hip thrust est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec barre / machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Hollow hold",
    description: "Hollow hold est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Jump squat",
    description: "Jump squat est un exercice de cardio / hiit rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "CARDIO",
  },
  {
    name: "Jumping jacks",
    description: "Jumping jacks est un exercice de full body / fonctionnel rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Kettlebell swing",
    description: "Kettlebell swing est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec kettlebell. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Kickback fessier poulie",
    description: "Kickback fessier poulie est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Kickback triceps",
    description: "Kickback triceps est un exercice de triceps rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Leg curl allongï¿½",
    description: "Leg curl allongï¿½ est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Leg curl assis",
    description: "Leg curl assis est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Leg curl debout",
    description: "Leg curl debout est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Leg extension",
    description: "Leg extension est un exercice de jambes - quadriceps rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Med ball slam",
    description: "Med ball slam est un exercice de full body / fonctionnel rï¿½alisï¿½ avec mï¿½decine ball. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Mollets ï¿½ la presse",
    description: "Mollets ï¿½ la presse est un exercice de mollets rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Mollets assis",
    description: "Mollets assis est un exercice de mollets rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Mollets debout",
    description: "Mollets debout est un exercice de mollets rï¿½alisï¿½ avec machine / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Mollets unilatï¿½ral",
    description: "Mollets unilatï¿½ral est un exercice de mollets rï¿½alisï¿½ avec poids du corps / haltï¿½re. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Montï¿½es de genoux",
    description: "Montï¿½es de genoux est un exercice de cardio / hiit rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Mountain climbers",
    description: "Mountain climbers est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Nordic curl",
    description: "Nordic curl est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ avancï¿½.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Oiseau haltï¿½res",
    description: "Oiseau haltï¿½res est un exercice d'ï¿½paules rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Oiseau sur banc inclinï¿½",
    description: "Oiseau sur banc inclinï¿½ est un exercice d'ï¿½paules rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pallof press",
    description: "Pallof press est un exercice d'abdos / gainage rï¿½alisï¿½ avec poulie / ï¿½lastique. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pec deck",
    description: "Pec deck est un exercice de pectoraux rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pike push-up",
    description: "Pike push-up est un exercice d'ï¿½paules rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pistol squat assistï¿½",
    description: "Pistol squat assistï¿½ est un exercice de jambes - quadriceps rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ avancï¿½.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Planche",
    description: "Planche est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Planche latï¿½rale",
    description: "Planche latï¿½rale est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Plate pinch",
    description: "Plate pinch est un exercice de avant-bras / grip rï¿½alisï¿½ avec disques. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pompes classiques",
    description: "Pompes classiques est un exercice de pectoraux rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pompes dï¿½clinï¿½es",
    description: "Pompes dï¿½clinï¿½es est un exercice de pectoraux rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pompes diamant",
    description: "Pompes diamant est un exercice de pectoraux rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pompes explosives",
    description: "Pompes explosives est un exercice de pectoraux rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ avancï¿½.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pompes inclinï¿½es",
    description: "Pompes inclinï¿½es est un exercice de pectoraux rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Presse ï¿½ cuisses",
    description: "Presse ï¿½ cuisses est un exercice de jambes - quadriceps rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pull-over haltï¿½re",
    description: "Pull-over haltï¿½re est un exercice de pectoraux rï¿½alisï¿½ avec haltï¿½re. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pull-over poulie",
    description: "Pull-over poulie est un exercice de dos rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pull-through",
    description: "Pull-through est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rameur",
    description: "Rameur est un exercice de cardio / hiit rï¿½alisï¿½ avec rameur. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Relevï¿½ de genoux suspendu",
    description: "Relevï¿½ de genoux suspendu est un exercice d'abdos / gainage rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Relevï¿½ de jambes au sol",
    description: "Relevï¿½ de jambes au sol est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Relevï¿½ de jambes suspendu",
    description: "Relevï¿½ de jambes suspendu est un exercice d'abdos / gainage rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Renegade row",
    description: "Renegade row est un exercice de full body / fonctionnel rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Reverse crunch",
    description: "Reverse crunch est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Reverse pec deck",
    description: "Reverse pec deck est un exercice d'ï¿½paules rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rotation externe ï¿½paule",
    description: "Rotation externe ï¿½paule est un exercice d'ï¿½paules rï¿½alisï¿½ avec ï¿½lastique / poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing assis poulie basse",
    description: "Rowing assis poulie basse est un exercice de dos rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing barre",
    description: "Rowing barre est un exercice de dos rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing haltï¿½re unilatï¿½ral",
    description: "Rowing haltï¿½re unilatï¿½ral est un exercice de dos rï¿½alisï¿½ avec haltï¿½re. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing machine",
    description: "Rowing machine est un exercice de dos rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing T-bar",
    description: "Rowing T-bar est un exercice de dos rï¿½alisï¿½ avec machine / barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Russian twist",
    description: "Russian twist est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps / disque. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Sauts ï¿½ la corde",
    description: "Sauts ï¿½ la corde est un exercice de mollets rï¿½alisï¿½ avec corde. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Shadow boxing",
    description: "Shadow boxing est un exercice de cardio / hiit rï¿½alisï¿½ avec aucun. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Shoulder press",
    description: "Shoulder press est un exercice d'ï¿½paules rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Shrugs",
    description: "Shrugs est un exercice de dos rï¿½alisï¿½ avec barre / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Sissy squat",
    description: "Sissy squat est un exercice de jambes - quadriceps rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ avancï¿½.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Sit-up",
    description: "Sit-up est un exercice d'abdos / gainage rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Sled push",
    description: "Sled push est un exercice de full body / fonctionnel rï¿½alisï¿½ avec traï¿½neau. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Soulevï¿½ de terre",
    description: "Soulevï¿½ de terre est un exercice de dos rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ avancï¿½.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Soulevï¿½ de terre jambes tendues",
    description: "Soulevï¿½ de terre jambes tendues est un exercice de jambes - ischios / fessiers rï¿½alisï¿½ avec barre / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Soulevï¿½ de terre roumain",
    description: "Soulevï¿½ de terre roumain est un exercice de dos rï¿½alisï¿½ avec barre / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Sprint",
    description: "Sprint est un exercice de cardio / hiit rï¿½alisï¿½ avec aucun. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "CARDIO",
  },
  {
    name: "Squat arriï¿½re",
    description: "Squat arriï¿½re est un exercice de jambes - quadriceps rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Squat avant",
    description: "Squat avant est un exercice de jambes - quadriceps rï¿½alisï¿½ avec barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ avancï¿½.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Squat sautï¿½",
    description: "Squat sautï¿½ est un exercice de jambes - quadriceps rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Step-up",
    description: "Step-up est un exercice de jambes - quadriceps rï¿½alisï¿½ avec banc / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Superman",
    description: "Superman est un exercice de dos rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Svend press",
    description: "Svend press est un exercice de pectoraux rï¿½alisï¿½ avec disque. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tate press",
    description: "Tate press est un exercice de triceps rï¿½alisï¿½ avec haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Thruster",
    description: "Thruster est un exercice de full body / fonctionnel rï¿½alisï¿½ avec haltï¿½res / barre. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tirage bras tendus",
    description: "Tirage bras tendus est un exercice de dos rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tirage vertical poitrine",
    description: "Tirage vertical poitrine est un exercice de dos rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tirage vertical prise serrï¿½e",
    description: "Tirage vertical prise serrï¿½e est un exercice de dos rï¿½alisï¿½ avec poulie. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tractions assistï¿½es",
    description: "Tractions assistï¿½es est un exercice de dos rï¿½alisï¿½ avec machine / ï¿½lastique. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tractions prise neutre",
    description: "Tractions prise neutre est un exercice de dos rï¿½alisï¿½ avec barre de traction. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tractions pronation",
    description: "Tractions pronation est un exercice de dos rï¿½alisï¿½ avec barre de traction. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tractions supination",
    description: "Tractions supination est un exercice de dos rï¿½alisï¿½ avec barre de traction. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Turkish get-up",
    description: "Turkish get-up est un exercice de full body / fonctionnel rï¿½alisï¿½ avec kettlebell. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ avancï¿½.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Upright row",
    description: "Upright row est un exercice d'ï¿½paules rï¿½alisï¿½ avec barre / haltï¿½res. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Vï¿½lo",
    description: "Vï¿½lo est un exercice de cardio / hiit rï¿½alisï¿½ avec vï¿½lo. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Vï¿½lo elliptique",
    description: "Vï¿½lo elliptique est un exercice de cardio / hiit rï¿½alisï¿½ avec machine. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Wall sit / chaise",
    description: "Wall sit / chaise est un exercice de jambes - quadriceps rï¿½alisï¿½ avec poids du corps. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ dï¿½butant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Woodchopper",
    description: "Woodchopper est un exercice d'abdos / gainage rï¿½alisï¿½ avec poulie / ï¿½lastique. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Wrist roller",
    description: "Wrist roller est un exercice de avant-bras / grip rï¿½alisï¿½ avec rouleau poignet. Il dï¿½veloppe la force, la technique et la coordination du geste, avec un niveau recommandï¿½ intermï¿½diaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
];

const workoutTemplates = [
  {
    name: "Cardio debutant",
    category: "Cardio",
    level: "Debutant",
    duration: 20,
    description: "Seance cardio simple pour reprendre progressivement.",
    displayOrder: 1,
    exercises: [
      { name: "Vï¿½lo", sets: 1, reps: 0, durationSeconds: 600, rest: 60 },
      { name: "Rameur", sets: 1, reps: 0, durationSeconds: 300, rest: 60 },
      { name: "Corde ï¿½ sauter", sets: 1, reps: 0, durationSeconds: 300, rest: 60 },
    ],
  },
  {
    name: "Full body poids du corps debutant",
    category: "Poids du corps",
    level: "Debutant",
    duration: 25,
    description: "Base complete sans charge pour construire une routine.",
    displayOrder: 2,
    exercises: [
      { name: "Pompes inclinï¿½es", sets: 3, reps: 10, rest: 60 },
      { name: "Wall sit / chaise", sets: 3, reps: 0, durationSeconds: 30, rest: 60 },
      { name: "Planche", sets: 3, reps: 0, durationSeconds: 30, rest: 60 },
      { name: "Crunch", sets: 3, reps: 15, rest: 45 },
    ],
  },
  {
    name: "Push",
    category: "Musculation",
    level: "Intermediaire",
    duration: 60,
    description: "Pectoraux, epaules et triceps.",
    displayOrder: 3,
    exercises: [
      { name: "Dï¿½veloppï¿½ couchï¿½", sets: 4, reps: 8, rest: 120 },
      { name: "Dï¿½veloppï¿½ inclinï¿½ haltï¿½res", sets: 3, reps: 10, rest: 90 },
      { name: "Shoulder press", sets: 3, reps: 10, rest: 90 },
      { name: "Extension triceps poulie corde", sets: 3, reps: 12, rest: 60 },
    ],
  },
  {
    name: "Pull",
    category: "Musculation",
    level: "Intermediaire",
    duration: 60,
    description: "Dos et biceps.",
    displayOrder: 4,
    exercises: [
      { name: "Tractions assistï¿½es", sets: 4, reps: 8, rest: 120 },
      { name: "Rowing barre", sets: 4, reps: 8, rest: 120 },
      { name: "Tirage vertical poitrine", sets: 3, reps: 10, rest: 90 },
      { name: "Curl barre EZ", sets: 3, reps: 12, rest: 60 },
    ],
  },
  {
    name: "Legs",
    category: "Musculation",
    level: "Intermediaire",
    duration: 60,
    description: "Quadriceps, ischios et mollets.",
    displayOrder: 5,
    exercises: [
      { name: "Squat arriï¿½re", sets: 4, reps: 8, rest: 150 },
      { name: "Presse ï¿½ cuisses", sets: 4, reps: 10, rest: 120 },
      { name: "Leg curl assis", sets: 3, reps: 12, rest: 90 },
      { name: "Mollets debout", sets: 4, reps: 15, rest: 60 },
    ],
  },
];

const foods = [
  {
    name: "Riz basmati",
    brand: null,
    barcode: null,
    caloriesKcal: 350,
    proteinGrams: 7,
    carbsGrams: 78,
    fatGrams: 1,
    fiberGrams: null,
    servingUnit: "g",
  },
  {
    name: "Pates completes",
    brand: null,
    barcode: null,
    caloriesKcal: 350,
    proteinGrams: 13,
    carbsGrams: 65,
    fatGrams: 2.5,
    fiberGrams: 8,
    servingUnit: "g",
  },
  {
    name: "Blanc de poulet",
    brand: null,
    barcode: null,
    caloriesKcal: 110,
    proteinGrams: 23,
    carbsGrams: 0,
    fatGrams: 1.5,
    fiberGrams: null,
    servingUnit: "g",
  },
  {
    name: "Oeufs",
    brand: null,
    barcode: null,
    caloriesKcal: 143,
    proteinGrams: 13,
    carbsGrams: 1,
    fatGrams: 10,
    fiberGrams: null,
    servingUnit: "g",
  },
  {
    name: "Banane",
    brand: null,
    barcode: null,
    caloriesKcal: 89,
    proteinGrams: 1.1,
    carbsGrams: 23,
    fatGrams: 0.3,
    fiberGrams: 2.6,
    servingUnit: "g",
  },
  {
    name: "Flocons d'avoine",
    brand: null,
    barcode: null,
    caloriesKcal: 370,
    proteinGrams: 13,
    carbsGrams: 60,
    fatGrams: 7,
    fiberGrams: 10,
    servingUnit: "g",
  },
  {
    name: "Yaourt grec",
    brand: null,
    barcode: null,
    caloriesKcal: 97,
    proteinGrams: 9,
    carbsGrams: 4,
    fatGrams: 5,
    fiberGrams: null,
    servingUnit: "g",
  },
  {
    name: "Huile d'olive",
    brand: null,
    barcode: null,
    caloriesKcal: 884,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 100,
    fiberGrams: null,
    servingUnit: "g",
  },
];

async function upsertAdminAccount() {
  const password = await bcrypt.hash(adminPassword, PASSWORD_SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: ADMIN_NAME,
      password,
    },
    create: {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password,
    },
  });
}

async function upsertExercises() {
  for (const exercise of exercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: {
          description: exercise.description,
          difficulty: exercise.difficulty,
          exerciseType: exercise.exerciseType,
        },
      });
      continue;
    }

    await prisma.exercise.create({
      data: {
        name: exercise.name,
        description: exercise.description,
        difficulty: exercise.difficulty,
        exerciseType: exercise.exerciseType,
      },
    });
  }
}

async function upsertWorkoutTemplates() {
  for (const template of workoutTemplates) {
    const savedTemplate = await prisma.workoutTemplate.upsert({
      where: { name: template.name },
      update: {
        category: template.category,
        level: template.level,
        duration: template.duration,
        description: template.description,
        displayOrder: template.displayOrder,
      },
      create: {
        name: template.name,
        category: template.category,
        level: template.level,
        duration: template.duration,
        description: template.description,
        displayOrder: template.displayOrder,
      },
    });

    await prisma.workoutTemplateExercise.deleteMany({
      where: { templateId: savedTemplate.id },
    });

    for (const [index, exercise] of template.exercises.entries()) {
      const savedExercise = await prisma.exercise.findFirst({
        where: { name: exercise.name },
      });

      if (!savedExercise) {
        throw new Error(`Exercice introuvable pour le modele: ${exercise.name}`);
      }

      await prisma.workoutTemplateExercise.create({
        data: {
          templateId: savedTemplate.id,
          exerciseId: savedExercise.id,
          order: index,
          sets: exercise.sets,
          reps: exercise.reps,
          durationSeconds: exercise.durationSeconds ?? null,
          rest: exercise.rest,
          weight: 0,
        },
      });
    }
  }
}

async function upsertGlobalFoods() {
  for (const food of foods) {
    const existing = await prisma.food.findFirst({
      where: { name: food.name, userId: null },
    });

    if (existing) {
      await prisma.food.update({
        where: { id: existing.id },
        data: food,
      });
      continue;
    }

    await prisma.food.create({
      data: {
        ...food,
        userId: null,
      },
    });
  }
}

try {
  await upsertAdminAccount();
  await upsertExercises();
  await upsertWorkoutTemplates();
  await upsertGlobalFoods();

  console.info("Production seed OK");
  console.info(`Account: ${ADMIN_EMAIL}`);
  console.info(`Account name: ${ADMIN_NAME}`);
  console.info(`Exercises upserted: ${exercises.length}`);
  console.info(`Workout templates upserted: ${workoutTemplates.length}`);
  console.info(`Global foods upserted: ${foods.length}`);

  if (generatedPassword) {
    console.info(`Generated password: ${adminPassword}`);
    console.info("Store this password securely; it is not written anywhere.");
  } else {
    console.info("Password source: SEED_ACCOUNT_PASSWORD");
  }
} catch (error) {
  console.error("Production seed failed", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}



