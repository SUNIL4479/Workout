export interface DetailedExercise {
  id: string;
  name: string;
  category: "Strength" | "Cardio" | "Core" | "Mobility";
  bodyPart: "Chest" | "Legs" | "Core" | "Full Body" | "Back" | "Shoulders" | "Arms";
  targetMuscles: string;
  secondaryMuscles?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  equipment: "No equipment" | "Chair" | "Wall" | "Backpack" | "Resistance band";
  startingPosition: string;
  movementPattern: string;
  executionSteps: string[];
  tempo: string; // e.g. "2-1-2-1"
  recommendedReps?: number;
  recommendedDuration?: number;
  safetyNotes: string;
  commonMistakes: string[];
  contraindications: string[]; // e.g., ["Acute knee injury", "Severe lumbar hernia"]
  mannequinPrompt?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: "approved" | "pending" | "rejected";
  cameraPreset: "three_quarter" | "front" | "side";
  animationType: "pushup" | "squat" | "plank" | "lunge" | "jumping_jacks" | "burpee" | "crunch" | "mountain_climbers" | "stretching";
}

export const DETAILED_EXERCISE_DATABASE: DetailedExercise[] = [
  {
    id: "pushups",
    name: "Standard Push-Up",
    category: "Strength",
    bodyPart: "Chest",
    targetMuscles: "Pectoralis Major, Triceps Brachii, Anterior Deltoids",
    secondaryMuscles: "Rectus Abdominis, Serratus Anterior",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "Plank position on hands and toes, hands under shoulders, spine neutral.",
    movementPattern: "Horizontal push & descent",
    executionSteps: [
      "1. Place hands shoulder-width apart with fingers pointing forward.",
      "2. Brace core and squeeze glutes to lock hips in a straight line with heels.",
      "3. Bend elbows at roughly 45 degrees to lower chest until 2 inches above floor.",
      "4. Drive through palms to press back up explosively without arching lower back."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 12,
    safetyNotes: "Keep core locked. Avoid hip sagging or neck hyperextension.",
    commonMistakes: ["Flaring elbows out to 90 degrees", "Sagging hips", "Shortening range of motion"],
    contraindications: ["Acute wrist sprain", "Severe shoulder impingement"],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "pushup"
  },
  {
    id: "air_squats",
    name: "Bodyweight Deep Squat",
    category: "Strength",
    bodyPart: "Legs",
    targetMuscles: "Quadriceps, Gluteus Maximus, Hamstrings",
    secondaryMuscles: "Calves, Erector Spinae",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Feet shoulder-width apart, toes turned slightly outward 15 degrees, chest tall.",
    movementPattern: "Vertical knee-hip flexion",
    executionSteps: [
      "1. Stand tall with feet grounded, heels glued to floor.",
      "2. Hinge at hips and bend knees simultaneously, pushing hips backward as if sitting.",
      "3. Descend until thighs are parallel or below knee crease.",
      "4. Push through mid-foot and heels to drive back up to full standing extension."
    ],
    tempo: "3-1-1-1",
    recommendedReps: 15,
    safetyNotes: "Ensure knees track in line with toes without collapsing inward (valgus).",
    commonMistakes: ["Knees collapsing inward", "Heels lifting off floor", "Rounding lower back"],
    contraindications: ["Acute knee ligament strain", "Severe hip bursitis"],
    mannequinPrompt: "A 3D white mannequin figure performing deep bodyweight squats in a dark studio, keeping heels grounded and chest upright, studio rim lighting.",
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "squat"
  },
  {
    id: "plank_hold",
    name: "Forearm Core Plank",
    category: "Core",
    bodyPart: "Core",
    targetMuscles: "Transverse Abdominis, Rectus Abdominis, Obliques",
    secondaryMuscles: "Gluteus Maximus, Quadriceps, Shoulders",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Forearms grounded parallel on floor, elbows under shoulders, body in a straight line.",
    movementPattern: "Isometric core stability hold",
    executionSteps: [
      "1. Place elbows directly beneath shoulders with forearms flat on floor.",
      "2. Extend legs backward on toes, locking hips in line with shoulders.",
      "3. Pull belly button toward spine and squeeze glutes tightly.",
      "4. Maintain steady diaphragmatic breathing for duration of hold."
    ],
    tempo: "Isometric",
    recommendedDuration: 45,
    safetyNotes: "Do not let lower back arch downward or hips lift excessively high.",
    commonMistakes: ["Sagging lower back", "Holding breath", "Piking hips into V-shape"],
    contraindications: ["Uncontrolled high blood pressure", "Severe acute lumbar hernia"],
    mannequinPrompt: "A 3D white mannequin holding a rock-solid forearm plank pose on a dark metallic floor, body in a straight line from head to heels.",
    status: "approved",
    cameraPreset: "side",
    animationType: "plank"
  },
  {
    id: "reverse_lunges",
    name: "Alternating Reverse Lunge",
    category: "Strength",
    bodyPart: "Legs",
    targetMuscles: "Quadriceps, Gluteus Maximus, Hamstrings",
    secondaryMuscles: "Adductors, Gastrocnemius, Core Balance",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing upright with feet hip-width apart, arms at sides or hands on hips.",
    movementPattern: "Single-leg knee flexion & step back",
    executionSteps: [
      "1. Step backward smoothly with left foot, planting toes.",
      "2. Bend both knees to 90 degrees until back knee lightly hovers above floor.",
      "3. Press through front right heel to step left leg back forward.",
      "4. Alternate legs rhythmically."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 12,
    safetyNotes: "Keep front knee aligned over second toe and keep torso upright.",
    commonMistakes: ["Leaning forward at waist", "Front knee caving inward", "Banging rear knee on floor"],
    contraindications: ["Severe patellar tendinitis"],
    mannequinPrompt: "A 3D white mannequin performing alternating reverse lunges in a dark futuristic studio, 90 degree leg bend, dramatic studio lighting.",
    status: "approved",
    cameraPreset: "side",
    animationType: "lunge"
  },
  {
    id: "jumping_jacks",
    name: "Cardio Jumping Jacks",
    category: "Cardio",
    bodyPart: "Full Body",
    targetMuscles: "Calves, Deltoids, Hip Abductors, Heart Rate",
    secondaryMuscles: "Core, Quadriceps",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing tall, arms at sides, feet together.",
    movementPattern: "Dynamic explosive abduction",
    executionSteps: [
      "1. Jump feet outwards wider than shoulders while swinging arms overhead.",
      "2. Land softly on balls of feet.",
      "3. Immediately jump feet back together while lowering arms to sides.",
      "4. Maintain a fast, smooth cardio cadence."
    ],
    tempo: "Fast",
    recommendedDuration: 45,
    safetyNotes: "Land lightly to absorb impact through ankles and knees.",
    commonMistakes: ["Heavy heel landing", "Not extending arms overhead fully"],
    contraindications: ["Severe joint arthritis", "Recent ankle sprain"],
    mannequinPrompt: "A 3D white mannequin executing full speed jumping jacks in a dark metallic gym studio, arms meeting overhead, soft landing on toes.",
    status: "approved",
    cameraPreset: "front",
    animationType: "jumping_jacks"
  },
  {
    id: "burpee",
    name: "Metabolic Burpee Jump",
    category: "Cardio",
    bodyPart: "Full Body",
    targetMuscles: "Pectoralis, Quadriceps, Core, Cardiovascular System",
    secondaryMuscles: "Triceps, Shoulders, Calves",
    difficulty: "Advanced",
    equipment: "No equipment",
    startingPosition: "Standing upright, feet shoulder-width apart.",
    movementPattern: "Explosive drop to floor & vertical jump",
    executionSteps: [
      "1. Drop hands to floor and kick feet back into high plank position.",
      "2. Lower chest to floor in a controlled push-up.",
      "3. Press chest up and snap feet back toward hands into squat.",
      "4. Explode vertically into a jump with hands reaching overhead."
    ],
    tempo: "Explosive",
    recommendedReps: 10,
    safetyNotes: "Maintain rigid core when kicking back into plank to protect lower spine.",
    commonMistakes: ["Sagging lumbar spine in plank", "Slumping down without control"],
    contraindications: ["Unstable wrist", "Severe lower back strain"],
    mannequinPrompt: "A 3D white mannequin executing an explosive burpee with chest-to-floor pushup and vertical jump, dark reflective background.",
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "burpee"
  },
  {
    id: "mountain_climbers",
    name: "High-Plank Mountain Climbers",
    category: "Cardio",
    bodyPart: "Core",
    targetMuscles: "Rectus Abdominis, Hip Flexors, Anterior Deltoids",
    secondaryMuscles: "Chest, Obliques, Calves",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "High push-up plank with arms extended under shoulders.",
    movementPattern: "Alternating rapid knee drives",
    executionSteps: [
      "1. Maintain rigid high plank with shoulders stacked directly over wrists.",
      "2. Drive right knee forward toward chest without lifting hips high.",
      "3. Quickly switch legs, driving left knee forward as right leg extends.",
      "4. Run continuously with a light, rapid rhythm."
    ],
    tempo: "Fast Cadence",
    recommendedDuration: 30,
    safetyNotes: "Keep shoulders over wrists and hips level with shoulders.",
    commonMistakes: ["Piking hips into air", "Bouncing upper body"],
    contraindications: ["Wrist arthritis", "Acute hip flexor strain"],
    mannequinPrompt: "A 3D white mannequin in a high plank driving knees rapidly toward chest in a athletic mountain climber motion, studio spotlight.",
    status: "approved",
    cameraPreset: "side",
    animationType: "mountain_climbers"
  },
  {
    id: "cat_cow_stretch",
    name: "Cat-Cow Spine Mobilizer",
    category: "Mobility",
    bodyPart: "Back",
    targetMuscles: "Spinal Erectors, Thoracic Spine, Cervical Spine",
    secondaryMuscles: "Abdominals, Neck",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "All-fours position with hands under shoulders and knees under hips.",
    movementPattern: "Spinal flexion & extension",
    executionSteps: [
      "1. Exhale and arch spine upward toward ceiling like a cat, tucking chin to chest.",
      "2. Inhale deeply and gently lower belly toward floor while lifting chest and tailbone.",
      "3. Flow smoothly between cat and cow postures."
    ],
    tempo: "Slow Breathing",
    recommendedDuration: 60,
    safetyNotes: "Move gently within pain-free range of motion.",
    commonMistakes: ["Forcing neck hyper-extension", "Moving too quickly"],
    contraindications: ["Fresh spinal surgery"],
    mannequinPrompt: "A 3D white mannequin performing dynamic cat cow spine mobilizer on all fours in a dark tranquil studio setting.",
    status: "approved",
    cameraPreset: "side",
    animationType: "stretching"
  }
];

export function getExerciseById(id: string): DetailedExercise {
  const found = DETAILED_EXERCISE_DATABASE.find((ex) => ex.id === id);
  if (found) return found;
  return DETAILED_EXERCISE_DATABASE[0];
}

export function searchExercises(query: string, category?: string): DetailedExercise[] {
  return DETAILED_EXERCISE_DATABASE.filter((ex) => {
    const matchesQuery =
      !query ||
      ex.name.toLowerCase().includes(query.toLowerCase()) ||
      ex.targetMuscles.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !category || category === "All" || ex.category === category;
    return matchesQuery && matchesCategory;
  });
}
