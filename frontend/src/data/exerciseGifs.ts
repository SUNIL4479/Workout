// ExerciseDB Animated GIF Repository and Dynamic API Fetcher
// Powered directly by https://oss.exercisedb.dev/api/v1/exercises

export interface ExerciseDBItem {
  id: string;
  name: string;
  target: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  secondaryMuscles?: string[];
  instructions?: string[];
}

// In-memory cache of live-fetched exercises from ExerciseDB
let liveExerciseDbCache: ExerciseDBItem[] = [];
let isFetchingDb = false;

// Per-exercise unique GIF mapping — keyed by exercise ID from exerciseService.ts.
// Each body part group uses entirely distinct gifUrl values so exercises never
// visually repeat within the same muscle group.
export const EXERCISE_SPECIFIC_GIF: Record<string, ExerciseDBItem> = {
  // ── Chest (6 exercises · 6 unique GIFs) ──
  pushups:         { id: "I4hDWkc", name: "Push-Up",                    target: "Pectorals",          bodyPart: "Chest",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/I4hDWkc.gif" },
  wide_pushups:    { id: "11wrviz", name: "Isometric Wipers",           target: "Pectorals",          bodyPart: "Chest",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/11wrviz.gif" },
  decline_pushups: { id: "13TpY4H", name: "Raise Single Arm Push-Up",  target: "Upper Chest",        bodyPart: "Chest",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/13TpY4H.gif" },
  diamond_pushups: { id: "05Cf2v8", name: "Impossible Dips",           target: "Inner Chest",        bodyPart: "Chest",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/05Cf2v8.gif" },
  incline_pushups: { id: "0br45wL", name: "Push-Up Inside Leg Kick",   target: "Lower Chest",        bodyPart: "Chest",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0br45wL.gif" },
  knee_pushups:    { id: "01qpYSe", name: "Upward Facing Dog",         target: "Chest & Triceps",    bodyPart: "Chest",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/01qpYSe.gif" },
  chest_squeeze:   { id: "CosupLu", name: "Front Plank With Twist",    target: "Inner Pectorals",    bodyPart: "Chest",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/CosupLu.gif" },

  // ── Arms (6 exercises · 6 unique GIFs) ──
  bicep_curls:    { id: "2NpxjC1", name: "Dumbbell Hammer Curl V.2",    target: "Biceps",             bodyPart: "Arms",      equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/2NpxjC1.gif" },
  tricep_dips:    { id: "dK9394r", name: "Burpee",                     target: "Triceps",            bodyPart: "Arms",      equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/dK9394r.gif" },
  hammer_curls:   { id: "2sQGZ5b", name: "Dumbbell One Arm Hammer Curl",target: "Brachialis",         bodyPart: "Arms",      equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/2sQGZ5b.gif" },
  plank_taps:     { id: "0Yz8WdV", name: "Bear Crawl",                 target: "Triceps & Core",     bodyPart: "Arms",      equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0Yz8WdV.gif" },

  // ── Abs (6 exercises · 6 unique GIFs) ──
  crunches:        { id: "TFqbd8t", name: "Crunch (Floor)",            target: "Rectus Abdominis",   bodyPart: "Waist",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/TFqbd8t.gif" },
  leg_raises:      { id: "03lzqwk", name: "Assisted Hanging Knee Raise",target: "Lower Abs",          bodyPart: "Waist",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/03lzqwk.gif" },
  plank_hold:      { id: "hCjGsRQ", name: "Power Point Plank",         target: "Core Stabilizers",   bodyPart: "Waist",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/hCjGsRQ.gif" },
  bicycle_crunch:  { id: "tZkGYZ9", name: "Band Bicycle Crunch",       target: "Obliques & Abs",     bodyPart: "Waist",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/tZkGYZ9.gif" },
  russian_twists:  { id: "fZFZ704", name: "Weighted Russian Twist",    target: "Obliques",           bodyPart: "Waist",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/fZFZ704.gif" },
  mountain_climbers:{ id: "RJgzwny", name: "Mountain Climber",          target: "Abs & Hip Flexors",  bodyPart: "Waist",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/RJgzwny.gif" },

  // ── Legs (6 exercises · 6 unique GIFs) ──
  air_squats:      { id: "QChZi3x", name: "Squat to Overhead Reach",   target: "Quads & Glutes",     bodyPart: "Upper Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/QChZi3x.gif" },
  reverse_lunges:  { id: "IZVHb27", name: "Walking Lunge",             target: "Quads & Glutes",     bodyPart: "Upper Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/IZVHb27.gif" },
  calf_raises:     { id: "0jp9Rlz", name: "One Leg Floor Calf Raise",  target: "Calves",             bodyPart: "Lower Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0jp9Rlz.gif" },
  wall_sit:        { id: "5VXmnV5", name: "Bodyweight Incline Side Plank",target: "Quads (Isometric)", bodyPart: "Upper Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/5VXmnV5.gif" },
  glute_bridge:    { id: "0rHfvy9", name: "Inverse Leg Curl",          target: "Glutes & Hamstrings",bodyPart: "Upper Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0rHfvy9.gif" },
  sumo_squats:     { id: "BL3GHeY", name: "Straddle Planche",          target: "Inner Thighs & Quads",bodyPart: "Upper Legs",equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/BL3GHeY.gif" },

  // ── Shoulders (6 exercises · 6 unique GIFs) ──
  pike_pushups:    { id: "0V2YQjW", name: "Pull Up (Neutral Grip)",    target: "Deltoids",           bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0V2YQjW.gif" },
  shoulder_press:  { id: "1VpF8db", name: "Dumbbell Bicep Curl Lunge", target: "Anterior Deltoids",   bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/1VpF8db.gif" },
  lateral_raises:  { id: "2JCuFTU", name: "Dumbbell Kneeling Curl Ball",target: "Lateral Deltoids",   bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/2JCuFTU.gif" },
  front_raises:    { id: "2kattbR", name: "EZ Barbell Spider Curl",    target: "Anterior Deltoids",   bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/2kattbR.gif" },
  arm_circles:     { id: "17bqEXD", name: "Seated Calf Stretch",       target: "Rotator Cuff",        bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/17bqEXD.gif" },
  bear_crawl_hold: { id: "0mB6wHO", name: "Runners Stretch",           target: "Shoulder Stabilizers",bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0mB6wHO.gif" },

  // ── Mobility / Stretch ──
  cat_cow_stretch: { id: "DFGXwZr", name: "World Greatest Stretch",    target: "Spine & Flexibility",bodyPart: "Back",      equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/DFGXwZr.gif" },
};

// Name-to-key lookup so the resolver can find per-exercise GIFs by display name.
// Keys are normalised (lowercase, non-alphanumeric → underscore, trimmed).
const _NAME_TO_KEY: Record<string, string> = {
  abdominal_crunches:               "crunches",
  lying_leg_raises:                 "leg_raises",
  forearm_core_plank:               "plank_hold",
  cross_body_bicycle_crunches:      "bicycle_crunch",
  seated_russian_twists:            "russian_twists",
  high_plank_mountain_climbers:     "mountain_climbers",
  bicep_peak_iso_curls:             "bicep_curls",
  chair_bench_tricep_dips:          "tricep_dips",
  hammer_grip_arm_curls:            "hammer_curls",
  classic_push_ups:                 "pushups",
  tricep_diamond_push_ups:          "diamond_pushups",
  plank_shoulder_taps:              "plank_taps",
  wide_grip_pecoral_push_ups:       "wide_pushups",
  incline_chest_push_ups:           "incline_pushups",
  knee_supported_push_ups:          "knee_pushups",
  isometric_chest_press_hold:       "chest_squeeze",
  decline_elevated_push_ups:        "decline_pushups",
  bodyweight_deep_squat:            "air_squats",
  alternating_reverse_lunge:        "reverse_lunges",
  standing_calf_elevation_raises:   "calf_raises",
  isometric_quad_wall_sit:          "wall_sit",
  glute_bridge_drives:              "glute_bridge",
  wide_sumo_squats:                 "sumo_squats",
  deltoid_pike_push_ups:            "pike_pushups",
  overhead_iso_shoulder_press:      "shoulder_press",
  standing_lateral_deltoid_raises:  "lateral_raises",
  front_deltoid_elevation_raises:   "front_raises",
  rotator_cuff_arm_circles:         "arm_circles",
  bear_crawl_shoulder_hold:         "bear_crawl_hold",
  cat_cow_spine_mobilizer:          "cat_cow_stretch",
};

/** Normalise an exercise display name into a map-safe key. */
function normaliseExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

// Curated high-resolution ExerciseDB exercise GIFs using real ExerciseDB IDs and URLs
export const EXERCISE_DB_CATALOG: Record<string, ExerciseDBItem> = {
  pushup: {
    id: "I4hDWkc",
    name: "Push-Up",
    target: "Pectorals (Chest)",
    bodyPart: "Chest",
    equipment: "Body Weight",
    gifUrl: "https://static.exercisedb.dev/media/I4hDWkc.gif",
    secondaryMuscles: ["Triceps", "Front Deltoids", "Core"],
    instructions: [
      "Place hands slightly wider than shoulder-width apart.",
      "Lower your body until your chest almost touches the floor.",
      "Push back up to the starting position keeping your core engaged."
    ]
  },
  squat: {
    id: "QChZi3x",
    name: "Squat to Overhead Reach",
    target: "Quadriceps & Glutes",
    bodyPart: "Upper Legs",
    equipment: "Body Weight",
    gifUrl: "https://static.exercisedb.dev/media/QChZi3x.gif",
    secondaryMuscles: ["Hamstrings", "Calves", "Abs"],
    instructions: [
      "Stand with feet shoulder-width apart.",
      "Hinge at hips and bend knees as if sitting in a chair.",
      "Lower down until thighs are parallel to the ground, then press up through heels."
    ]
  },
  plank: {
    id: "hCjGsRQ",
    name: "Power Point Plank",
    target: "Abs & Core Stabilizers",
    bodyPart: "Waist",
    equipment: "Body Weight",
    gifUrl: "https://static.exercisedb.dev/media/hCjGsRQ.gif",
    secondaryMuscles: ["Shoulders", "Glutes"],
    instructions: [
      "Place forearms on the ground with elbows aligned below shoulders.",
      "Keep body in a straight line from head to heels.",
      "Hold position while breathing deeply and squeezing core."
    ]
  },
  lunge: {
    id: "IZVHb27",
    name: "Walking Lunge",
    target: "Quads, Glutes & Hamstrings",
    bodyPart: "Upper Legs",
    equipment: "Body Weight",
    gifUrl: "https://static.exercisedb.dev/media/IZVHb27.gif",
    secondaryMuscles: ["Calves", "Core"],
    instructions: [
      "Step forward with one leg and lower hips until both knees are bent at 90 degrees.",
      "Ensure front knee stays directly above ankle.",
      "Push back up through front heel to starting stance."
    ]
  },
  jumping_jacks: {
    id: "1g5bPpA",
    name: "Jack Jump (Jumping Jacks)",
    target: "Cardiovascular Stamina",
    bodyPart: "Full Body",
    equipment: "Body Weight",
    gifUrl: "https://static.exercisedb.dev/media/1g5bPpA.gif",
    secondaryMuscles: ["Calves", "Shoulders"],
    instructions: [
      "Stand upright with feet together and arms at sides.",
      "Jump or move laterally while keeping rhythm.",
      "Maintain active core and steady breathing."
    ]
  },
  mountain_climbers: {
    id: "RJgzwny",
    name: "Mountain Climber",
    target: "Abs & Hip Flexors",
    bodyPart: "Waist",
    equipment: "Body Weight",
    gifUrl: "https://static.exercisedb.dev/media/RJgzwny.gif",
    secondaryMuscles: ["Shoulders", "Chest", "Quads"],
    instructions: [
      "Start in a high push-up plank position.",
      "Drive one knee toward chest rapid fire.",
      "Alternate knees rapidly while maintaining flat hips."
    ]
  },
  burpees: {
    id: "dK9394r",
    name: "Burpee",
    target: "Cardio & Full Body Strength",
    bodyPart: "Full Body",
    equipment: "Body Weight",
    gifUrl: "https://static.exercisedb.dev/media/dK9394r.gif",
    secondaryMuscles: ["Chest", "Quads", "Abs"],
    instructions: [
      "Drop into a squat, place hands on floor and kick feet back into plank.",
      "Perform a push-up, jump feet forward back to squat position.",
      "Explode vertically with arms reaching overhead."
    ]
  },
  crunch: {
    id: "TFqbd8t",
    name: "Crunch (Floor)",
    target: "Rectus Abdominis",
    bodyPart: "Waist",
    equipment: "Body Weight",
    gifUrl: "https://static.exercisedb.dev/media/TFqbd8t.gif",
    secondaryMuscles: ["Obliques"],
    instructions: [
      "Lie on back with knees bent and feet flat.",
      "Place fingertips behind head lightly.",
      "Flex abdominals to lift shoulder blades off floor, pausing at peak tension."
    ]
  },
  stretching: {
    id: "DFGXwZr",
    name: "World Greatest Stretch",
    target: "Flexibility & Spine Extension",
    bodyPart: "Back & Core",
    equipment: "Body Weight",
    gifUrl: "https://static.exercisedb.dev/media/DFGXwZr.gif",
    secondaryMuscles: ["Hamstrings", "Spine", "Shoulders"],
    instructions: [
      "Inhale deeply and lengthen spine.",
      "Ease into joint stretches gently without forcing movement.",
      "Hold each stretch for 15-30 seconds with calm breathing."
    ]
  }
};

// Fetch live ExerciseDB API list from https://oss.exercisedb.dev/api/v1/exercises
export async function fetchLiveExerciseDBList(): Promise<ExerciseDBItem[]> {
  if (liveExerciseDbCache.length > 0) return liveExerciseDbCache;
  if (isFetchingDb) return liveExerciseDbCache;

  isFetchingDb = true;
  try {
    const res = await fetch("https://oss.exercisedb.dev/api/v1/exercises?limit=100");
    if (!res.ok) throw new Error("ExerciseDB API network response failed");
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      liveExerciseDbCache = json.data.map((item: any) => ({
        id: item.exerciseId || item.id,
        name: item.name || "Exercise",
        target: Array.isArray(item.targetMuscles) ? item.targetMuscles.join(", ") : (item.targetMuscles || item.target || "Full Body"),
        bodyPart: Array.isArray(item.bodyParts) ? item.bodyParts.join(", ") : (item.bodyParts || "Body"),
        equipment: Array.isArray(item.equipments) ? item.equipments.join(", ") : (item.equipments || "Body Weight"),
        gifUrl: item.gifUrl || `https://static.exercisedb.dev/media/${item.exerciseId}.gif`,
        secondaryMuscles: item.secondaryMuscles || [],
        instructions: item.instructions || []
      }));
    }
  } catch (err) {
    console.warn("Failed to fetch live ExerciseDB API, using catalog fallback:", err);
  } finally {
    isFetchingDb = false;
  }
  return liveExerciseDbCache;
}

// Helper function to resolve ExerciseDB GIF by name, animationType, or target muscle.
// The curated catalog is authoritative (verified GIFs); the live list is only used as a
// strong-match fallback so we never swap in a wrong or broken movement.
export function getExerciseDBGif(
  exerciseName: string,
  animationType?: string,
  targetMuscle?: string
): ExerciseDBItem {
  const nameLower = (exerciseName || "").toLowerCase();
  const animLower = (animationType || "").toLowerCase();
  const muscleLower = (targetMuscle || "").toLowerCase();

  // 1. Per-exercise unique map — highest priority, avoids same-GIF repeats
  const normalised = normaliseExerciseName(exerciseName || "");
  const mapKey = _NAME_TO_KEY[normalised] || normalised;
  if (EXERCISE_SPECIFIC_GIF[mapKey]) {
    return EXERCISE_SPECIFIC_GIF[mapKey];
  }

  // 2. Catalogue by animationType (fallback)
  if (animLower && EXERCISE_DB_CATALOG[animLower]) {
    return EXERCISE_DB_CATALOG[animLower];
  }

  // 3. Name search matching against the curated catalog
  if (nameLower.includes("push") || nameLower.includes("chest")) return EXERCISE_DB_CATALOG.pushup;
  if (nameLower.includes("squat") || nameLower.includes("leg")) return EXERCISE_DB_CATALOG.squat;
  if (nameLower.includes("plank") || nameLower.includes("core")) return EXERCISE_DB_CATALOG.plank;
  if (nameLower.includes("lunge")) return EXERCISE_DB_CATALOG.lunge;
  if (nameLower.includes("jack") || nameLower.includes("jump")) return EXERCISE_DB_CATALOG.jumping_jacks;
  if (nameLower.includes("climb") || nameLower.includes("mountain")) return EXERCISE_DB_CATALOG.mountain_climbers;
  if (nameLower.includes("burpee")) return EXERCISE_DB_CATALOG.burpees;
  if (nameLower.includes("crunch") || nameLower.includes("ab")) return EXERCISE_DB_CATALOG.crunch;
  if (nameLower.includes("stretch") || nameLower.includes("yoga") || nameLower.includes("warm")) return EXERCISE_DB_CATALOG.stretching;

  // 4. Muscle group fallback against the curated catalog
  if (muscleLower.includes("chest") || muscleLower.includes("tricep")) return EXERCISE_DB_CATALOG.pushup;
  if (muscleLower.includes("quad") || muscleLower.includes("glute")) return EXERCISE_DB_CATALOG.squat;
  if (muscleLower.includes("abs") || muscleLower.includes("waist")) return EXERCISE_DB_CATALOG.plank;

  // 5. Live cache as a last resort — only for strong, exact-ish matches so a wrong
  //    animation (e.g. "weighted sissy squat" for a deep bodyweight squat) is never used.
  if (liveExerciseDbCache.length > 0) {
    const liveMatch = liveExerciseDbCache.find(
      (ex) =>
        ex.name.toLowerCase() === nameLower ||
        ex.name.toLowerCase().includes(nameLower) ||
        (muscleLower && ex.target.toLowerCase() === muscleLower) ||
        (muscleLower &&
          ex.target
            .toLowerCase()
            .split(",")
            .map((t) => t.trim())
            .includes(muscleLower.split(",")[0].trim()))
    );
    if (liveMatch) return liveMatch;
  }

  return EXERCISE_DB_CATALOG.pushup;
}
