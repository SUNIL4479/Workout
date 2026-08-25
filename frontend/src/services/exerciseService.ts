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
      "3. Exhale and contract abdominals to lift shoulder blades 3-4 inches off floor.",
      "4. Pause at top contraction for 1 second, then slowly lower back down."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 20,
    safetyNotes: "Avoid pulling forward on your neck with your hands.",
    commonMistakes: ["Yanking neck forward", "Using momentum", "Holding breath"],
    contraindications: ["Acute cervical neck strain"],
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
      "1. Place hands under hips or lower back for spine support.",
      "2. Keeping legs together and straight, raise legs toward ceiling until vertical.",
      "3. Pause briefly at top, then lower legs under slow control without touching floor."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 15,
    safetyNotes: "Keep lower back pressed firmly into floor throughout.",
    commonMistakes: ["Arching lower back off floor", "Dropping legs too fast"],
    contraindications: ["Severe lumbar disc hernia"],
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
      "1. Place elbows directly beneath shoulders with forearms flat.",
      "2. Extend legs backward on toes, locking hips in line with shoulders.",
      "3. Squeeze glutes tightly and pull belly button toward spine.",
      "4. Maintain steady breathing for duration of hold."
    ],
    tempo: "Isometric",
    recommendedDuration: 40,
    safetyNotes: "Do not let lower back arch downward or hips pike excessively high.",
    commonMistakes: ["Sagging lower back", "Holding breath", "Piking hips into V-shape"],
    contraindications: ["Uncontrolled high blood pressure"],
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
    startingPosition: "Lie back with knees bent and fingertips behind ears.",
    movementPattern: "Rotational cross-body crunch",
    executionSteps: [
      "1. Lift shoulder blades off floor and raise legs to table top position.",
      "2. Rotate right shoulder to left knee while extending right leg straight out.",
      "3. Switch sides, rotating left shoulder to right knee while extending left leg."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 20,
    safetyNotes: "Initiate rotation from torso oblique contraction, not neck pulling.",
    commonMistakes: ["Twisting neck instead of chest", "Rushing movement"],
    contraindications: ["Acute neck pain"],
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
    startingPosition: "Sit on floor, lean torso back at 45 degrees, knees bent.",
    movementPattern: "Seated torso rotation",
    executionSteps: [
      "1. Balance on sit bones with feet hovering slightly or grounded.",
      "2. Clasp hands in front of chest and rotate torso to right side.",
      "3. Pause 1 second, then rotate torso fully to left side."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 24,
    safetyNotes: "Keep chest proud and spine neutral without hunching shoulders.",
    commonMistakes: ["Rounding spine", "Moving hands only without twisting torso"],
    contraindications: ["Acute lumbar strain"],
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
    targetMuscles: "Rectus Abdominis, Hip Flexors, Anterior Deltoids",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "High push-up plank with arms extended under shoulders.",
    movementPattern: "Alternating rapid knee drives",
    executionSteps: [
      "1. Maintain rigid high plank with shoulders stacked over wrists.",
      "2. Drive right knee forward toward chest without lifting hips.",
      "3. Switch legs rapidly, driving left knee forward as right leg extends."
    ],
    tempo: "Fast Cadence",
    recommendedDuration: 30,
    safetyNotes: "Keep shoulders stacked over wrists and hips level.",
    commonMistakes: ["Piking hips into air", "Bouncing upper body"],
    contraindications: ["Wrist arthritis"],
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
    targetMuscles: "Biceps Brachii, Brachialis",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing upright with arms at sides.",
    movementPattern: "Elbow flexion curl",
    executionSteps: [
      "1. Stand tall with elbows pinned to ribcage.",
      "2. Contract biceps to curl hands up toward shoulders.",
      "3. Squeeze biceps forcefully at peak height for 1 second, then lower."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 15,
    safetyNotes: "Avoid swinging body or flaring elbows outward.",
    commonMistakes: ["Swinging hips", "Moving elbows forward"],
    contraindications: ["Bicep tendonitis flare-up"],
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
    targetMuscles: "Triceps Brachii, Front Shoulders",
    difficulty: "Intermediate",
    equipment: "Chair",
    startingPosition: "Hands placed on edge of sturdy chair, hips hovering off edge.",
    movementPattern: "Vertical tricep dip",
    executionSteps: [
      "1. Place palms on chair edge shoulder-width apart.",
      "2. Bend elbows backward to lower body until upper arms are parallel to floor.",
      "3. Press through palms to extend arms fully and lock out triceps."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 12,
    safetyNotes: "Keep torso close to chair to avoid shoulder joint strain.",
    commonMistakes: ["Flaring elbows out to sides", "Moving too far away from chair"],
    contraindications: ["Acute shoulder impingement"],
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
    targetMuscles: "Brachialis, Forearm Flexors",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing upright, palms facing each other in neutral grip.",
    movementPattern: "Neutral grip elbow flexion",
    executionSteps: [
      "1. Keep palms facing inwards toward torso.",
      "2. Curl arms upward toward shoulders while maintaining thumbs-up grip.",
      "3. Lower under control without letting arms swing."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 14,
    safetyNotes: "Keep wrists straight and firm throughout movement.",
    commonMistakes: ["Bending wrists", "Arching lower back"],
    contraindications: ["Wrist sprain"],
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
    targetMuscles: "Triceps Brachii, Pectoralis Major, Deltoids",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "Plank position on hands and toes, hands under shoulders.",
    movementPattern: "Horizontal push",
    executionSteps: [
      "1. Place hands shoulder-width apart.",
      "2. Lower chest until 2 inches above floor, keeping elbows at 45 degrees.",
      "3. Drive palms down to extend arms fully."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 12,
    safetyNotes: "Keep core locked in straight plank.",
    commonMistakes: ["Flaring elbows to 90 degrees", "Sagging hips"],
    contraindications: ["Acute wrist injury"],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "pushup"
  },
  {
    id: "diamond_pushups",
    name: "Tricep Diamond Push-Ups",
    category: "Strength",
    bodyPart: "Arms",
    bodyFocus: "Arms",
    targetMuscles: "Triceps Lateral Head, Inner Chest",
    difficulty: "Advanced",
    equipment: "No equipment",
    startingPosition: "High plank with thumbs and index fingers touching under chest.",
    movementPattern: "Close-grip push",
    executionSteps: [
      "1. Place hands close together forming diamond shape.",
      "2. Lower chest to touch hands while keeping elbows close to body.",
      "3. Press up powerfully to lock out triceps."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 10,
    safetyNotes: "If wrist pressure occurs, widen hands slightly.",
    commonMistakes: ["Flaring elbows out wide", "Arching lower back"],
    contraindications: ["Wrist sprain"],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "pushup"
  },
  {
    id: "plank_taps",
    name: "Plank Shoulder Taps",
    category: "Core",
    bodyPart: "Arms",
    bodyFocus: "Arms",
    targetMuscles: "Arms, Shoulders, Core",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "High plank position, feet slightly wide for balance.",
    movementPattern: "Single-arm anti-rotational hold",
    executionSteps: [
      "1. Hold rigid push-up plank.",
      "2. Lift right hand to tap left shoulder, then return.",
      "3. Lift left hand to tap right shoulder."
    ],
    tempo: "1-1-1-1",
    recommendedReps: 20,
    safetyNotes: "Squeeze glutes to stop hips from swaying side to side.",
    commonMistakes: ["Twisting hips excessively"],
    contraindications: ["Wrist sprain"],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "plank"
  },

  // CHEST
  {
    id: "wide_pushups",
    name: "Wide-Grip Pectoral Push-Ups",
    category: "Strength",
    bodyPart: "Chest",
    bodyFocus: "Chest",
    targetMuscles: "Outer Pectoralis Major, Chest",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "Hands placed 1.5x shoulder width apart.",
    movementPattern: "Wide horizontal push",
    executionSteps: [
      "1. Set hands wider than shoulders.",
      "2. Lower chest smoothly until elbows bend 90 degrees.",
      "3. Press up forcefully concentrating on chest squeeze."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 12,
    safetyNotes: "Do not let shoulders shrug up toward ears.",
    commonMistakes: ["Shortening range of motion"],
    contraindications: ["Shoulder impingement"],
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
    targetMuscles: "Lower Pectoralis Major, Chest",
    difficulty: "Beginner",
    equipment: "Chair",
    startingPosition: "Hands placed on chair or bench edge, feet on floor.",
    movementPattern: "Incline push",
    executionSteps: [
      "1. Place hands on elevated chair surface.",
      "2. Lower chest toward chair edge in straight line body stance.",
      "3. Press back up to arm lockout."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 14,
    safetyNotes: "Ensure chair is securely anchored.",
    commonMistakes: ["Bending at hips"],
    contraindications: ["Acute wrist sprain"],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "pushup"
  },
  {
    id: "knee_pushups",
    name: "Knee-Supported Push-Ups",
    category: "Strength",
    bodyPart: "Chest",
    bodyFocus: "Chest",
    targetMuscles: "Chest, Front Shoulders, Triceps",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Plank on knees with ankles crossed behind.",
    movementPattern: "Modified push-up",
    executionSteps: [
      "1. Support body weight on knees and hands.",
      "2. Lower chest to floor while maintaining straight knees-to-head alignment.",
      "3. Press up to standing knee plank."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 12,
    safetyNotes: "Keep core tight.",
    commonMistakes: ["Sticking hips backward"],
    contraindications: ["Knee cap pain"],
    status: "approved",
    cameraPreset: "three_quarter",
    animationType: "pushup"
  },
  {
    id: "chest_squeeze",
    name: "Isometric Chest Press & Hold",
    category: "Strength",
    bodyPart: "Chest",
    bodyFocus: "Chest",
    targetMuscles: "Inner Pectoralis Major",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Palms pressed together in front of sternum.",
    movementPattern: "Isometric chest contraction",
    executionSteps: [
      "1. Press palms together firmly at chest height.",
      "2. Forcefully press hands into each other to engage chest.",
      "3. Hold max contraction for 40 seconds."
    ],
    tempo: "Isometric",
    recommendedDuration: 40,
    safetyNotes: "Keep breathing steady.",
    commonMistakes: ["Holding breath"],
    contraindications: [],
    status: "approved",
    cameraPreset: "front",
    animationType: "pushup"
  },
  {
    id: "decline_pushups",
    name: "Decline Elevated Push-Ups",
    category: "Strength",
    bodyPart: "Chest",
    bodyFocus: "Chest",
    targetMuscles: "Upper Chest, Pectoralis Minor",
    difficulty: "Advanced",
    equipment: "Chair",
    startingPosition: "Feet elevated on chair, hands on floor.",
    movementPattern: "Decline push",
    executionSteps: [
      "1. Place toes on elevated surface with hands on floor.",
      "2. Lower chest down toward floor.",
      "3. Press up focusing on upper chest contraction."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 10,
    safetyNotes: "Maintain rigid core alignment.",
    commonMistakes: ["Sagging waist"],
    contraindications: ["Shoulder strain"],
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
    targetMuscles: "Quadriceps, Gluteus Maximus, Hamstrings",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Feet shoulder-width apart, toes turned outward 15 degrees.",
    movementPattern: "Vertical knee-hip flexion",
    executionSteps: [
      "1. Stand tall with feet grounded.",
      "2. Hinge hips back and bend knees down into squat position.",
      "3. Descend until thighs are parallel to ground.",
      "4. Push through mid-foot and heels to stand back up."
    ],
    tempo: "3-1-1-1",
    recommendedReps: 15,
    safetyNotes: "Keep knees tracking in line with toes.",
    commonMistakes: ["Knees collapsing inward", "Heels lifting"],
    contraindications: ["Acute knee ligament strain"],
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
    targetMuscles: "Quadriceps, Gluteus Maximus, Hamstrings",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing upright with feet hip-width apart.",
    movementPattern: "Single-leg step back",
    executionSteps: [
      "1. Step backward smoothly with left foot.",
      "2. Bend both knees to 90 degrees until rear knee hovers off floor.",
      "3. Push through front right heel to step back to start position.",
      "4. Alternate legs."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 14,
    safetyNotes: "Keep front knee stacked over ankle.",
    commonMistakes: ["Leaning forward at waist"],
    contraindications: ["Patellar tendinitis"],
    status: "approved",
    cameraPreset: "side",
    animationType: "lunge"
  },
  {
    id: "calf_raises",
    name: "Standing Calf Elevation Raises",
    category: "Strength",
    bodyPart: "Legs",
    bodyFocus: "Legs",
    targetMuscles: "Gastrocnemius, Soleus, Calves",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing tall, feet hip-width apart.",
    movementPattern: "Ankle plantar flexion",
    executionSteps: [
      "1. Rise up onto balls of feet as high as possible.",
      "2. Hold contraction at top for 1 second.",
      "3. Lower heels softly back down."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 20,
    safetyNotes: "Use wall for balance if needed.",
    commonMistakes: ["Rushing tempo"],
    contraindications: ["Achilles tendinitis"],
    status: "approved",
    cameraPreset: "front",
    animationType: "squat"
  },
  {
    id: "wall_sit",
    name: "Isometric Quad Wall Sit",
    category: "Strength",
    bodyPart: "Legs",
    bodyFocus: "Legs",
    targetMuscles: "Quadriceps, Glutes",
    difficulty: "Intermediate",
    equipment: "Wall",
    startingPosition: "Back against wall, knees bent at 90 degrees.",
    movementPattern: "Isometric leg hold",
    executionSteps: [
      "1. Slide back down wall until thighs are parallel to floor.",
      "2. Press back flat against wall with feet flat.",
      "3. Hold position firmly for 45 seconds."
    ],
    tempo: "Isometric",
    recommendedDuration: 45,
    safetyNotes: "Keep knees directly over ankles.",
    commonMistakes: ["Slumping hips down too low"],
    contraindications: ["Severe knee osteoarthritis"],
    status: "approved",
    cameraPreset: "side",
    animationType: "squat"
  },
  {
    id: "glute_bridge",
    name: "Glute Bridge Drives",
    category: "Strength",
    bodyPart: "Legs",
    bodyFocus: "Legs",
    targetMuscles: "Gluteus Maximus, Hamstrings",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Lie on back with knees bent, feet flat on floor.",
    movementPattern: "Hip extension drive",
    executionSteps: [
      "1. Drive hips upward by squeezing glutes.",
      "2. Form straight line from shoulders to knees.",
      "3. Hold top squeeze 2 seconds, then lower under control."
    ],
    tempo: "2-2-2-1",
    recommendedReps: 16,
    safetyNotes: "Do not over-arch lower back at top.",
    commonMistakes: ["Arching lower back instead of squeezing glutes"],
    contraindications: [],
    status: "approved",
    cameraPreset: "side",
    animationType: "squat"
  },
  {
    id: "sumo_squats",
    name: "Wide Sumo Squats",
    category: "Strength",
    bodyPart: "Legs",
    bodyFocus: "Legs",
    targetMuscles: "Inner Thigh Adductors, Glutes, Quads",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "Wide stance, toes pointed outward 45 degrees.",
    movementPattern: "Wide knee-hip flexion",
    executionSteps: [
      "1. Lower hips deep into wide stance squat.",
      "2. Ensure knees track outward in line with toes.",
      "3. Press through heels to stand tall."
    ],
    tempo: "3-1-1-1",
    recommendedReps: 15,
    safetyNotes: "Do not let knees cave inward.",
    commonMistakes: ["Knees collapsing inward"],
    contraindications: ["Groin muscle strain"],
    status: "approved",
    cameraPreset: "front",
    animationType: "squat"
  },

  // SHOULDERS
  {
    id: "pike_pushups",
    name: "Deltoid Pike Push-Ups",
    category: "Strength",
    bodyPart: "Shoulders",
    bodyFocus: "Shoulders",
    targetMuscles: "Anterior Deltoids, Upper Back",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "Inverted V-shape pike position on hands and toes.",
    movementPattern: "Overhead pushing angle",
    executionSteps: [
      "1. Walk feet toward hands to raise hips high in pike.",
      "2. Bend elbows to lower forehead toward floor.",
      "3. Press through palms to push back up into inverted V."
    ],
    tempo: "2-1-1-1",
    recommendedReps: 10,
    safetyNotes: "Keep pike shape solid.",
    commonMistakes: ["Lowering hips into regular plank"],
    contraindications: ["Shoulder impingement"],
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
    targetMuscles: "Anterior & Lateral Deltoids",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing upright, hands held at shoulder level.",
    movementPattern: "Overhead vertical press",
    executionSteps: [
      "1. Hold hands at shoulder height.",
      "2. Drive hands upward overhead to arm extension.",
      "3. Lower back down to shoulder level."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 15,
    safetyNotes: "Keep core engaged to avoid arching back.",
    commonMistakes: ["Leaning backward"],
    contraindications: ["Rotator cuff tear"],
    status: "approved",
    cameraPreset: "front",
    animationType: "pushup"
  },
  {
    id: "lateral_raises",
    name: "Standing Lateral Deltoid Raises",
    category: "Strength",
    bodyPart: "Shoulders",
    bodyFocus: "Shoulders",
    targetMuscles: "Lateral Deltoids, Trapezius",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing tall with arms at sides.",
    movementPattern: "Arm abduction",
    executionSteps: [
      "1. Raise arms out to sides until shoulder height.",
      "2. Pause 1 second at shoulder level.",
      "3. Lower arms smoothly back down."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 15,
    safetyNotes: "Lead with elbows and avoid shrugging.",
    commonMistakes: ["Swinging body weight"],
    contraindications: ["Shoulder bursitis"],
    status: "approved",
    cameraPreset: "front",
    animationType: "pushup"
  },
  {
    id: "front_raises",
    name: "Front Deltoid Elevation Raises",
    category: "Strength",
    bodyPart: "Shoulders",
    bodyFocus: "Shoulders",
    targetMuscles: "Anterior Deltoids",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Standing tall, arms in front of thighs.",
    movementPattern: "Forward shoulder flexion",
    executionSteps: [
      "1. Raise arms straight forward up to eye level.",
      "2. Pause at top, then lower with control."
    ],
    tempo: "2-1-2-1",
    recommendedReps: 14,
    safetyNotes: "Keep torso steady.",
    commonMistakes: ["Rocking torso"],
    contraindications: [],
    status: "approved",
    cameraPreset: "front",
    animationType: "pushup"
  },
  {
    id: "arm_circles",
    name: "Rotator Cuff Arm Circles",
    category: "Mobility",
    bodyPart: "Shoulders",
    bodyFocus: "Shoulders",
    targetMuscles: "Rotator Cuff, Deltoids",
    difficulty: "Beginner",
    equipment: "No equipment",
    startingPosition: "Arms extended straight out to sides.",
    movementPattern: "Rotator cuff mobility circle",
    executionSteps: [
      "1. Extend arms to sides at shoulder height.",
      "2. Rotate arms in small smooth circles forward.",
      "3. Reverse direction to small circles backward."
    ],
    tempo: "Continuous",
    recommendedDuration: 45,
    safetyNotes: "Keep shoulders relaxed.",
    commonMistakes: ["Dropping arm height below shoulders"],
    contraindications: [],
    status: "approved",
    cameraPreset: "front",
    animationType: "stretching"
  },
  {
    id: "bear_crawl_hold",
    name: "Bear Crawl Shoulder Hold",
    category: "Core",
    bodyPart: "Shoulders",
    bodyFocus: "Shoulders",
    targetMuscles: "Shoulder Stabilizers, Core",
    difficulty: "Intermediate",
    equipment: "No equipment",
    startingPosition: "All-fours position, knees hovering 2 inches off floor.",
    movementPattern: "Isometric shoulder stability hold",
    executionSteps: [
      "1. Lift knees 2 inches off floor from all-fours position.",
      "2. Support weight on hands and toes while keeping back flat.",
      "3. Push floor away strongly with shoulders."
    ],
    tempo: "Isometric",
    recommendedDuration: 40,
    safetyNotes: "Keep knees under hips.",
    commonMistakes: ["Lifting hips high in air"],
    contraindications: ["Wrist sprain"],
    status: "approved",
    cameraPreset: "side",
    animationType: "plank"
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
