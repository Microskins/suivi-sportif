import { ExerciseDifficulty, ExerciseType, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const exercises = [
  {
    name: "Écarté à la poulie",
    description: "Écarté à la poulie est un exercice de pectoraux réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Écarté couché haltères",
    description: "Écarté couché haltères est un exercice de pectoraux réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Écarté incliné haltères",
    description: "Écarté incliné haltères est un exercice de pectoraux réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Élévations frontales",
    description: "Élévations frontales est un exercice d'épaules réalisé avec haltères / disque. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Élévations latérales",
    description: "Élévations latérales est un exercice d'épaules réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Élévations latérales poulie",
    description: "Élévations latérales poulie est un exercice d'épaules réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Ab wheel rollout",
    description: "Ab wheel rollout est un exercice d'abdos / gainage réalisé avec roue abdominale. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Abduction hanche machine",
    description: "Abduction hanche machine est un exercice de jambes - ischios / fessiers réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Arnold press",
    description: "Arnold press est un exercice d'épaules réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Assault bike",
    description: "Assault bike est un exercice de cardio / hiit réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "CARDIO",
  },
  {
    name: "Barre au front",
    description: "Barre au front est un exercice de triceps réalisé avec barre ez. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Battle rope",
    description: "Battle rope est un exercice de full body / fonctionnel réalisé avec cordes. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Bear crawl",
    description: "Bear crawl est un exercice de full body / fonctionnel réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Burpees",
    description: "Burpees est un exercice de full body / fonctionnel réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Chest press",
    description: "Chest press est un exercice de pectoraux réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Clean and press",
    description: "Clean and press est un exercice de full body / fonctionnel réalisé avec barre / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé avancé.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Corde à sauter",
    description: "Corde à sauter est un exercice de cardio / hiit réalisé avec corde. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Course tapis",
    description: "Course tapis est un exercice de cardio / hiit réalisé avec tapis. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Crunch",
    description: "Crunch est un exercice d'abdos / gainage réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Crunch poulie haute",
    description: "Crunch poulie haute est un exercice d'abdos / gainage réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Cuban press",
    description: "Cuban press est un exercice d'épaules réalisé avec haltères légers. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl barre droite",
    description: "Curl barre droite est un exercice de biceps réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl barre EZ",
    description: "Curl barre EZ est un exercice de biceps réalisé avec barre ez. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl câble unilatéral",
    description: "Curl câble unilatéral est un exercice de biceps réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl concentration",
    description: "Curl concentration est un exercice de biceps réalisé avec haltère. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl haltères alterné",
    description: "Curl haltères alterné est un exercice de biceps réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl incliné",
    description: "Curl incliné est un exercice de biceps réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl inversé",
    description: "Curl inversé est un exercice de biceps réalisé avec barre / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl marteau",
    description: "Curl marteau est un exercice de biceps réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl poignets",
    description: "Curl poignets est un exercice de avant-bras / grip réalisé avec barre / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl poignets inversé",
    description: "Curl poignets inversé est un exercice de avant-bras / grip réalisé avec barre / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl poulie basse",
    description: "Curl poulie basse est un exercice de biceps réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl pupitre",
    description: "Curl pupitre est un exercice de biceps réalisé avec barre / machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl spider",
    description: "Curl spider est un exercice de biceps réalisé avec barre / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Curl Zottman",
    description: "Curl Zottman est un exercice de biceps réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dead bug",
    description: "Dead bug est un exercice d'abdos / gainage réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dead hang",
    description: "Dead hang est un exercice de avant-bras / grip réalisé avec barre de traction. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Développé couché",
    description: "Développé couché est un exercice de pectoraux réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Développé couché haltères",
    description: "Développé couché haltères est un exercice de pectoraux réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Développé couché prise serrée",
    description: "Développé couché prise serrée est un exercice de triceps réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Développé décliné",
    description: "Développé décliné est un exercice de pectoraux réalisé avec barre / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Développé épaules haltères",
    description: "Développé épaules haltères est un exercice d'épaules réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Développé incliné barre",
    description: "Développé incliné barre est un exercice de pectoraux réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Développé incliné haltères",
    description: "Développé incliné haltères est un exercice de pectoraux réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Développé militaire",
    description: "Développé militaire est un exercice d'épaules réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dips buste penché",
    description: "Dips buste penché est un exercice de pectoraux réalisé avec barres parallèles. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Dips triceps",
    description: "Dips triceps est un exercice de triceps réalisé avec banc / barres. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Donkey calf raise",
    description: "Donkey calf raise est un exercice de mollets réalisé avec machine / partenaire. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Donkey kicks",
    description: "Donkey kicks est un exercice de jambes - ischios / fessiers réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension nuque barre EZ",
    description: "Extension nuque barre EZ est un exercice de triceps réalisé avec barre ez. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension nuque haltère",
    description: "Extension nuque haltère est un exercice de triceps réalisé avec haltère. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension triceps au-dessus de la tête poulie",
    description: "Extension triceps au-dessus de la tête poulie est un exercice de triceps réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension triceps poulie barre",
    description: "Extension triceps poulie barre est un exercice de triceps réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension triceps poulie corde",
    description: "Extension triceps poulie corde est un exercice de triceps réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extension triceps unilatérale",
    description: "Extension triceps unilatérale est un exercice de triceps réalisé avec poulie / haltère. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Extensions lombaires",
    description: "Extensions lombaires est un exercice de dos réalisé avec banc lombaire. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Face pull",
    description: "Face pull est un exercice de dos réalisé avec poulie / élastique. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Farmer walk",
    description: "Farmer walk est un exercice de avant-bras / grip réalisé avec haltères / kettlebells. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Farmer walk sur pointes",
    description: "Farmer walk sur pointes est un exercice de mollets réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Fentes arrière",
    description: "Fentes arrière est un exercice de jambes - ischios / fessiers réalisé avec poids du corps / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Fentes avant",
    description: "Fentes avant est un exercice de jambes - quadriceps réalisé avec poids du corps / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Fentes bulgares",
    description: "Fentes bulgares est un exercice de jambes - quadriceps réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Fentes marchées",
    description: "Fentes marchées est un exercice de jambes - quadriceps réalisé avec poids du corps / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Fire hydrants",
    description: "Fire hydrants est un exercice de jambes - ischios / fessiers réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Gainage Superman",
    description: "Gainage Superman est un exercice d'abdos / gainage réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Glute bridge",
    description: "Glute bridge est un exercice de jambes - ischios / fessiers réalisé avec poids du corps / barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Goblet squat",
    description: "Goblet squat est un exercice de jambes - quadriceps réalisé avec haltère / kettlebell. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Good morning",
    description: "Good morning est un exercice de jambes - ischios / fessiers réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé avancé.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Hack squat",
    description: "Hack squat est un exercice de jambes - quadriceps réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Handstand push-up",
    description: "Handstand push-up est un exercice d'épaules réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé avancé.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Hip thrust",
    description: "Hip thrust est un exercice de jambes - ischios / fessiers réalisé avec barre / machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Hollow hold",
    description: "Hollow hold est un exercice d'abdos / gainage réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Jump squat",
    description: "Jump squat est un exercice de cardio / hiit réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "CARDIO",
  },
  {
    name: "Jumping jacks",
    description: "Jumping jacks est un exercice de full body / fonctionnel réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Kettlebell swing",
    description: "Kettlebell swing est un exercice de jambes - ischios / fessiers réalisé avec kettlebell. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Kickback fessier poulie",
    description: "Kickback fessier poulie est un exercice de jambes - ischios / fessiers réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Kickback triceps",
    description: "Kickback triceps est un exercice de triceps réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Leg curl allongé",
    description: "Leg curl allongé est un exercice de jambes - ischios / fessiers réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Leg curl assis",
    description: "Leg curl assis est un exercice de jambes - ischios / fessiers réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Leg curl debout",
    description: "Leg curl debout est un exercice de jambes - ischios / fessiers réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Leg extension",
    description: "Leg extension est un exercice de jambes - quadriceps réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Med ball slam",
    description: "Med ball slam est un exercice de full body / fonctionnel réalisé avec médecine ball. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Mollets à la presse",
    description: "Mollets à la presse est un exercice de mollets réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Mollets assis",
    description: "Mollets assis est un exercice de mollets réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Mollets debout",
    description: "Mollets debout est un exercice de mollets réalisé avec machine / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Mollets unilatéral",
    description: "Mollets unilatéral est un exercice de mollets réalisé avec poids du corps / haltère. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Montées de genoux",
    description: "Montées de genoux est un exercice de cardio / hiit réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Mountain climbers",
    description: "Mountain climbers est un exercice d'abdos / gainage réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Nordic curl",
    description: "Nordic curl est un exercice de jambes - ischios / fessiers réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé avancé.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Oiseau haltères",
    description: "Oiseau haltères est un exercice d'épaules réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Oiseau sur banc incliné",
    description: "Oiseau sur banc incliné est un exercice d'épaules réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pallof press",
    description: "Pallof press est un exercice d'abdos / gainage réalisé avec poulie / élastique. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pec deck",
    description: "Pec deck est un exercice de pectoraux réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pike push-up",
    description: "Pike push-up est un exercice d'épaules réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pistol squat assisté",
    description: "Pistol squat assisté est un exercice de jambes - quadriceps réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé avancé.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Planche",
    description: "Planche est un exercice d'abdos / gainage réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Planche latérale",
    description: "Planche latérale est un exercice d'abdos / gainage réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Plate pinch",
    description: "Plate pinch est un exercice de avant-bras / grip réalisé avec disques. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pompes classiques",
    description: "Pompes classiques est un exercice de pectoraux réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pompes déclinées",
    description: "Pompes déclinées est un exercice de pectoraux réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pompes diamant",
    description: "Pompes diamant est un exercice de pectoraux réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pompes explosives",
    description: "Pompes explosives est un exercice de pectoraux réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé avancé.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pompes inclinées",
    description: "Pompes inclinées est un exercice de pectoraux réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Presse à cuisses",
    description: "Presse à cuisses est un exercice de jambes - quadriceps réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pull-over haltère",
    description: "Pull-over haltère est un exercice de pectoraux réalisé avec haltère. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pull-over poulie",
    description: "Pull-over poulie est un exercice de dos réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Pull-through",
    description: "Pull-through est un exercice de jambes - ischios / fessiers réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rameur",
    description: "Rameur est un exercice de cardio / hiit réalisé avec rameur. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Relevé de genoux suspendu",
    description: "Relevé de genoux suspendu est un exercice d'abdos / gainage réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Relevé de jambes au sol",
    description: "Relevé de jambes au sol est un exercice d'abdos / gainage réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Relevé de jambes suspendu",
    description: "Relevé de jambes suspendu est un exercice d'abdos / gainage réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Renegade row",
    description: "Renegade row est un exercice de full body / fonctionnel réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Reverse crunch",
    description: "Reverse crunch est un exercice d'abdos / gainage réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Reverse pec deck",
    description: "Reverse pec deck est un exercice d'épaules réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rotation externe épaule",
    description: "Rotation externe épaule est un exercice d'épaules réalisé avec Élastique / poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing assis poulie basse",
    description: "Rowing assis poulie basse est un exercice de dos réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing barre",
    description: "Rowing barre est un exercice de dos réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing haltère unilatéral",
    description: "Rowing haltère unilatéral est un exercice de dos réalisé avec haltère. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing machine",
    description: "Rowing machine est un exercice de dos réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Rowing T-bar",
    description: "Rowing T-bar est un exercice de dos réalisé avec machine / barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Russian twist",
    description: "Russian twist est un exercice d'abdos / gainage réalisé avec poids du corps / disque. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Sauts à la corde",
    description: "Sauts à la corde est un exercice de mollets réalisé avec corde. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Shadow boxing",
    description: "Shadow boxing est un exercice de cardio / hiit réalisé avec aucun. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Shoulder press",
    description: "Shoulder press est un exercice d'épaules réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Shrugs",
    description: "Shrugs est un exercice de dos réalisé avec barre / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Sissy squat",
    description: "Sissy squat est un exercice de jambes - quadriceps réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé avancé.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Sit-up",
    description: "Sit-up est un exercice d'abdos / gainage réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Sled push",
    description: "Sled push est un exercice de full body / fonctionnel réalisé avec traîneau. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Soulevé de terre",
    description: "Soulevé de terre est un exercice de dos réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé avancé.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Soulevé de terre jambes tendues",
    description: "Soulevé de terre jambes tendues est un exercice de jambes - ischios / fessiers réalisé avec barre / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Soulevé de terre roumain",
    description: "Soulevé de terre roumain est un exercice de dos réalisé avec barre / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Sprint",
    description: "Sprint est un exercice de cardio / hiit réalisé avec aucun. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "CARDIO",
  },
  {
    name: "Squat arrière",
    description: "Squat arrière est un exercice de jambes - quadriceps réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Squat avant",
    description: "Squat avant est un exercice de jambes - quadriceps réalisé avec barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé avancé.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Squat sauté",
    description: "Squat sauté est un exercice de jambes - quadriceps réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Step-up",
    description: "Step-up est un exercice de jambes - quadriceps réalisé avec banc / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Superman",
    description: "Superman est un exercice de dos réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Svend press",
    description: "Svend press est un exercice de pectoraux réalisé avec disque. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tate press",
    description: "Tate press est un exercice de triceps réalisé avec haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Thruster",
    description: "Thruster est un exercice de full body / fonctionnel réalisé avec haltères / barre. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tirage bras tendus",
    description: "Tirage bras tendus est un exercice de dos réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tirage vertical poitrine",
    description: "Tirage vertical poitrine est un exercice de dos réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tirage vertical prise serrée",
    description: "Tirage vertical prise serrée est un exercice de dos réalisé avec poulie. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tractions assistées",
    description: "Tractions assistées est un exercice de dos réalisé avec machine / élastique. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tractions prise neutre",
    description: "Tractions prise neutre est un exercice de dos réalisé avec barre de traction. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tractions pronation",
    description: "Tractions pronation est un exercice de dos réalisé avec barre de traction. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Tractions supination",
    description: "Tractions supination est un exercice de dos réalisé avec barre de traction. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Turkish get-up",
    description: "Turkish get-up est un exercice de full body / fonctionnel réalisé avec kettlebell. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé avancé.",
    difficulty: "ADVANCED",
    exerciseType: "STRENGTH",
  },
  {
    name: "Upright row",
    description: "Upright row est un exercice d'épaules réalisé avec barre / haltères. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Vélo",
    description: "Vélo est un exercice de cardio / hiit réalisé avec vélo. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Vélo elliptique",
    description: "Vélo elliptique est un exercice de cardio / hiit réalisé avec machine. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "CARDIO",
  },
  {
    name: "Wall sit / chaise",
    description: "Wall sit / chaise est un exercice de jambes - quadriceps réalisé avec poids du corps. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé débutant.",
    difficulty: "BEGINNER",
    exerciseType: "STRENGTH",
  },
  {
    name: "Woodchopper",
    description: "Woodchopper est un exercice d'abdos / gainage réalisé avec poulie / élastique. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
    difficulty: "INTERMEDIATE",
    exerciseType: "STRENGTH",
  },
  {
    name: "Wrist roller",
    description: "Wrist roller est un exercice de avant-bras / grip réalisé avec rouleau poignet. Il développe la force, la technique et la coordination du geste, avec un niveau recommandé intermédiaire.",
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
      { name: "Vélo", sets: 1, reps: 0, durationSeconds: 600, rest: 60 },
      { name: "Rameur", sets: 1, reps: 0, durationSeconds: 300, rest: 60 },
      { name: "Corde à sauter", sets: 1, reps: 0, durationSeconds: 300, rest: 60 },
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
      { name: "Pompes inclinées", sets: 3, reps: 10, rest: 60 },
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
      { name: "Développé couché", sets: 4, reps: 8, rest: 120 },
      { name: "Développé incliné haltères", sets: 3, reps: 10, rest: 90 },
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
      { name: "Tractions assistées", sets: 4, reps: 8, rest: 120 },
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
      { name: "Squat arrière", sets: 4, reps: 8, rest: 150 },
      { name: "Presse à cuisses", sets: 4, reps: 10, rest: 120 },
      { name: "Leg curl assis", sets: 3, reps: 12, rest: 90 },
      { name: "Mollets debout", sets: 4, reps: 15, rest: 60 },
    ],
  },
];

async function seedExercises() {
  for (const exercise of exercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: {
          description: exercise.description,
          difficulty: exercise.difficulty as ExerciseDifficulty,
          exerciseType: exercise.exerciseType as ExerciseType,
        },
      });
      continue;
    }

    await prisma.exercise.create({
      data: {
        name: exercise.name,
        description: exercise.description,
        difficulty: exercise.difficulty as ExerciseDifficulty,
        exerciseType: exercise.exerciseType as ExerciseType,
      },
    });
  }
}

async function seedWorkoutTemplates() {
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

async function main() {
  await seedExercises();
  await seedWorkoutTemplates();
  console.info(
    `Seed termine: ${exercises.length} exercices et ${workoutTemplates.length} modeles disponibles.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed impossible a executer.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



