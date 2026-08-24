import { BodyFocusCategory } from "../types";

export interface DetailedExercise {
  id: string;
  name: string;
  category: "Strength" | "Cardio" | "Core" | "Mobility";
  bodyPart: "Chest" | "Legs" | "Core" | "Full Body" | "Back" | "Shoulders" | "Arms";
  bodyFocus?: BodyFocusCategory;
  targetMuscles: string;
  secondaryMuscles?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  equipment: "No equipment" | "Chair" | "Wall" | "Backpack" | "Resistance band";
  startingPosition: string;
  movementPattern: string;
  executionSteps: string[];
  tempo: string;
  recommendedReps?: number;
  recommendedDuration?: number;
  safetyNotes: string;
  commonMistakes: string[];
  contraindications: string[];
  status: "approved" | "pending" | "rejected";
  cameraPreset: "three_quarter" | "front" | "side";
  animationType: "pushup" | "squat" | "plank" | "lunge" | "jumping_jacks" | "burpee" | "crunch" | "mountain_climbers" | "stretching";
}

export const DETAILED_EXERCISE_DATABASE: DetailedExercise[] = [
  // ABS
  {
    id: "crunches",
    name: "Abdominal Crunches",
    category: "Core",
    bodyPart: "Core",
    bodyFocus: "Abs",
    targetMuscles: "Upper Abs, Rectus Abdominis",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Lie on back with knees bent at 90 degrees, feet flat on floor.",
    movementPattern: "Abdominal spinal flexion",
    executionSteps: [
      "1. Lie on back with knees bent and feet flat on floor.",
      "2. Cross arms over chest or place fingertips gently behind head.",
      "3. Exhale and contract abdominals to lift shoulder blades off floor.",
      "4. Pause at top contraction, then slowly lower back down."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 20,
    safetyNotes: "Avoid pulling forward on neck.",
    commonMistakes: ["Yanking neck", "Holding breath"],
    contraindications: ["Neck strain"],
    status: "approved",
    cameraPreset: "side",
    animationType: "crunch"
  },
  {
    id: "leg_raises",
    name: "Lying Leg Raises",
    category: "Core",
    bodyPart: "Core",
    bodyFocus: "Abs",
    targetMuscles: "Lower Abs, Hip Flexors",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "Lie flat on back with legs extended straight.",
    movementPattern: "Vertical leg elevation",
    executionSteps: [
      "1. Place hands under hips for spine support.",
      "2. Raise legs toward ceiling until vertical.",
      "3. Lower legs under slow control without touching floor."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 15,
    safetyNotes: "Keep lower back pressed firmly into floor.",
    commonMistakes: ["Arching lower back"],
    contraindications: ["Lumbar hernia"],
    status: "approved",
    cameraPreset: "side",
    animationType: "crunch"
  },
  {
    id: "plank_hold",
    name: "Forearm Core Plank",
    category: "Core",
    bodyPart: "Core",
    bodyFocus: "Abs",
    targetMuscles: "Transverse Abdominis, Rectus Abdominis, Obliques",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Forearms grounded parallel on floor, elbows under shoulders.",
    movementPattern: "Isometric core stability hold",
    executionSteps: [
      "1. Place elbows directly beneath shoulders.",
      "2. Extend legs backward on toes, locking body in straight line.",
      "3. Hold position firmly for 40 seconds."
    ],
    tempo: "Isometric",
    recommendedDuration: 40,
    safetyNotes: "Do not let hips sag.",
    commonMistakes: ["Sagging lower back"],
    contraindications: [],
    status: "approved",
    cameraPreset: "side",
    animationType: "plank"
  },
  {
    id: "bicycle_crunch",
    name: "Cross-Body Bicycle Crunches",
    category: "Core",
    bodyPart: "Core",
    bodyFocus: "Abs",
    targetMuscles: "Obliques, Upper Abs, Lower Abs",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "Lie back with knees bent.",
    movementPattern: "Rotational cross-body crunch",
    executionSteps: [
      "1. Rotate right shoulder to left knee while extending right leg.",
      "2. Switch sides smoothly in pedaling motion."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 20,
    safetyNotes: "Rotate from torso.",
    commonMistakes: ["Pulling neck"],
    contraindications: [],
    status: "approved",
    cameraPreset: "side",
    animationType: "crunch"
  },
  {
    id: "russian_twists",
    name: "Seated Russian Twists",
    category: "Core",
    bodyPart: "Core",
    bodyFocus: "Abs",
    targetMuscles: "Obliques, Transverse Abdominis",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "Sit on floor, lean back 45 degrees.",
    movementPattern: "Torso rotation",
    executionSteps: [
      "1. Clasp hands together.",
      "2. Rotate torso fully side to side."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 24,
    safetyNotes: "Keep spine tall.",
    commonMistakes: ["Hunching spine"],
    contraindications: [],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "crunch"
  },
  {
    id: "mountain_climbers",
    name: "High-Plank Mountain Climbers",
    category: "Cardio",
    bodyPart: "Core",
    bodyFocus: "Abs",
    targetMuscles: "Core Abs, Hip Flexors, Shoulders",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "High plank position.",
    movementPattern: "Knee drives",
    executionSteps: [
      "1. Maintain high plank.",
      "2. Drive knees rapidly toward chest in running motion."
    ],
    tempo: "Fast Cadence",
    recommendedDuration: 30,
    safetyNotes: "Keep hips level.",
    commonMistakes: ["Piking hips"],
    contraindications: [],
    status: "approved",
    cameraPreset: "side",
    animationType: "mountain_climbers"
  },

  // ARMS
  {
    id: "bicep_curls",
    name: "Bicep Peak Iso-Curls",
    category: "Strength",
    bodyPart: "Arms",
    bodyFocus: "Arms",
    targetMuscles: "Biceps Brachii, Forearms",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing upright with arms at sides.",
    movementPattern: "Elbow flexion curl",
    executionSteps: [
      "1. Pin elbows to ribcage.",
      "2. Curl hands toward shoulders, squeezing biceps."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 15,
    safetyNotes: "Do not swing body.",
    commonMistakes: ["Swinging body"],
    contraindications: [],
    status: "approved",
    cameraPreset: "front",
    animationType: "pushup"
  },
  {
    id: "tricep_dips",
    name: "Chair / Bench Tricep Dips",
    category: "Strength",
    bodyPart: "Arms",
    bodyFocus: "Arms",
    targetMuscles: "Triceps Brachii, Deltoids",
    difficulty: "Intermediate",
    equipment: "Chair",
    startingPosition: "Hands on chair edge.",
    movementPattern: "Tricep dip",
    executionSteps: [
      "1. Bend elbows backward to lower hips.",
      "2. Press through palms to extend arms fully."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 12,
    safetyNotes: "Keep back close to chair.",
    commonMistakes: ["Flaring elbows"],
    contraindications: [],
    status: "approved",
    cameraPreset: "side",
    animationType: "pushup"
  },
  {
    id: "hammer_curls",
    name: "Hammer Grip Arm Curls",
    category: "Strength",
    bodyPart: "Arms",
    bodyFocus: "Arms",
    targetMuscles: "Brachialis, Forearms",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Palms facing inwards.",
    movementPattern: "Neutral arm curl",
    executionSteps: [
      "1. Maintain thumbs-up grip.",
      "2. Curl arms upward toward shoulders."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 14,
    safetyNotes: "Keep wrists straight.",
    commonMistakes: [],
    contraindications: [],
    status: "approved",
    cameraPreset: "front",
    animationType: "pushup"
  },
  {
    id: "pushups",
    name: "Classic Push-Ups",
    category: "Strength",
    bodyPart: "Chest",
    bodyFocus: "Arms",
    targetMuscles: "Triceps, Chest, Deltoids",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "High plank.",
    movementPattern: "Push-up",
    executionSteps: [
      "1. Lower chest near floor.",
      "2. Press up to full arm extension."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 12,
    safetyNotes: "Keep body straight.",
    commonMistakes: ["Sagging hips"],
    contraindications: [],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "pushup"
  },

  // CHEST
  {
    id: "wide_pushups",
    name: "Wide-Grip Pectoral Push-Ups",
    category: "Strength",
    bodyPart: "Chest",
    bodyFocus: "Chest",
    targetMuscles: "Outer Chest, Pectorals",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "Hands placed wide.",
    movementPattern: "Wide push",
    executionSteps: [
      "1. Lower chest toward floor.",
      "2. Press up focusing on chest contraction."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 12,
    safetyNotes: "Keep shoulders down.",
    commonMistakes: [],
    contraindications: [],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "pushup"
  },
  {
    id: "incline_pushups",
    name: "Incline Chair Chest Push-Ups",
    category: "Strength",
    bodyPart: "Chest",
    bodyFocus: "Chest",
    targetMuscles: "Lower Chest, Pectorals",
    difficulty: "Beginner",
    equipment: "Chair",
    startingPosition: "Hands elevated on chair.",
    movementPattern: "Incline push",
    executionSteps: [
      "1. Lower chest to chair edge.",
      "2. Press back up."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 14,
    safetyNotes: "Anchor chair safely.",
    commonMistakes: [],
    contraindications: [],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "pushup"
  },

  // LEGS
  {
    id: "air_squats",
    name: "Bodyweight Deep Squat",
    category: "Strength",
    bodyPart: "Legs",
    bodyFocus: "Legs",
    targetMuscles: "Quadriceps, Glutes, Hamstrings",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Feet shoulder-width apart.",
    movementPattern: "Deep squat",
    executionSteps: [
      "1. Hinge hips back and bend knees.",
      "2. Descend to parallel, then press through heels to stand."
    ],
    tempo: "3-1-1-1",
    recommendedReps: 15,
    safetyNotes: "Keep heels grounded.",
    commonMistakes: ["Knees caving inward"],
    contraindications: [],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "squat"
  },
  {
    id: "reverse_lunges",
    name: "Alternating Reverse Lunge",
    category: "Strength",
    bodyPart: "Legs",
    bodyFocus: "Legs",
    targetMuscles: "Glutes, Quads, Hamstrings",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing upright.",
    movementPattern: "Reverse lunge step",
    executionSteps: [
      "1. Step back with left foot, bend knees to 90 degrees.",
      "2. Step forward to start and repeat right."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 14,
    safetyNotes: "Keep front knee over ankle.",
    commonMistakes: [],
    contraindications: [],
    status: "approved",
    cameraPreset: "side",
    animationType: "lunge"
  },

  // SHOULDERS
  {
    id: "pike_pushups",
    name: "Deltoid Pike Push-Ups",
    category: "Strength",
    bodyPart: "Shoulders",
    bodyFocus: "Shoulders",
    targetMuscles: "Anterior Deltoids, Overhead Shoulders",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "Pike V-shape posture.",
    movementPattern: "Pike press",
    executionSteps: [
      "1. Lower forehead toward floor.",
      "2. Press back up into inverted V."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 10,
    safetyNotes: "Keep hips raised high.",
    commonMistakes: [],
    contraindications: [],
    status: "approved",
    cameraPreset: "side",
    animationType: "pushup"
  },
  {
    id: "shoulder_press",
    name: "Overhead Iso Shoulder Press",
    category: "Strength",
    bodyPart: "Shoulders",
    bodyFocus: "Shoulders",
    targetMuscles: "Deltoids, Trapezius",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Hands at shoulder level.",
    movementPattern: "Vertical overhead press",
    executionSteps: [
      "1. Press hands overhead to extension.",
      "2. Lower back to shoulder level."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 15,
    safetyNotes: "Keep core tight.",
    commonMistakes: [],
    contraindications: [],
    status: "approved",
    cameraPreset: "front",
    animationType: "pushup"
  }
];

export function getExerciseById(id: string): DetailedExercise {
  const found = DETAILED_EXERCISE_DATABASE.find((ex) => ex.id === id);
  if (found) return found;
  return DETAILED_EXERCISE_DATABASE[0];
}

export function getExercisesByBodyFocus(category: BodyFocusCategory): DetailedExercise[] {
  return DETAILED_EXERCISE_DATABASE.filter((ex) => ex.bodyFocus === category);
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
