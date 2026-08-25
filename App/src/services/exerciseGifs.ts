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
  archer_pushups:  { id: "0br45wL", name: "Push-Up Inside Leg Kick",   target: "Chest & Core",       bodyPart: "Chest",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0br45wL.gif" },
  hindu_pushups:   { id: "01qpYSe", name: "Upward Facing Dog",         target: "Chest & Spine",      bodyPart: "Chest",     equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/01qpYSe.gif" },

  // ── Arms (5 exercises · 5 unique GIFs) ──
  tricep_dips_chair:  { id: "dK9394r", name: "Burpee",                 target: "Triceps",            bodyPart: "Arms",      equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/dK9394r.gif" },
  close_grip_pushups: { id: "0V2YQjW", name: "Pull Up Neutral Grip",   target: "Triceps",            bodyPart: "Arms",      equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0V2YQjW.gif" },
  plank_updowns:      { id: "RJgzwny", name: "Mountain Climber",       target: "Arms & Core",        bodyPart: "Arms",      equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/RJgzwny.gif" },
  tricep_extensions:  { id: "1g5bPpA", name: "Jack Jump",              target: "Triceps",            bodyPart: "Arms",      equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/1g5bPpA.gif" },
  shoulder_tap_pushup:{ id: "0Yz8WdV", name: "Bear Crawl",             target: "Triceps & Core",     bodyPart: "Arms",      equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0Yz8WdV.gif" },

  // ── Legs (9 exercises · 9 unique GIFs) ──
  air_squats:             { id: "QChZi3x", name: "Squat to Overhead Reach",  target: "Quads & Glutes",       bodyPart: "Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/QChZi3x.gif" },
  reverse_lunges:         { id: "IZVHb27", name: "Walking Lunge",            target: "Quads & Glutes",       bodyPart: "Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/IZVHb27.gif" },
  bulgarian_split_squat:  { id: "0mB6wHO", name: "Runners Stretch",          target: "Quads & Glutes",       bodyPart: "Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0mB6wHO.gif" },
  wall_sit:               { id: "hCjGsRQ", name: "Power Point Plank",        target: "Quads (Isometric)",    bodyPart: "Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/hCjGsRQ.gif" },
  calf_raises:            { id: "0jp9Rlz", name: "One Leg Floor Calf Raise", target: "Calves",               bodyPart: "Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0jp9Rlz.gif" },
  glute_bridge:           { id: "0rHfvy9", name: "Inverse Leg Curl",         target: "Glutes & Hamstrings", bodyPart: "Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0rHfvy9.gif" },
  sumo_squats:            { id: "DFGXwZr", name: "World Greatest Stretch",   target: "Inner Thighs & Quads",bodyPart: "Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/DFGXwZr.gif" },
  lateral_lunges:         { id: "TFqbd8t", name: "Crunch (Floor)",           target: "Adductors & Glutes",  bodyPart: "Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/TFqbd8t.gif" },
  jump_squats:            { id: "17bqEXD", name: "Seated Calf Stretch",      target: "Quads & Calves",      bodyPart: "Legs", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/17bqEXD.gif" },

  // ── Full Body (8 exercises · 8 unique GIFs) ──
  plank_hold:         { id: "I4hDWkc", name: "Push-Up",                  target: "Core",               bodyPart: "Full Body", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/I4hDWkc.gif" },
  mountain_climbers:  { id: "QChZi3x", name: "Squat to Overhead Reach",  target: "Core & Hip Flexors", bodyPart: "Full Body", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/QChZi3x.gif" },
  bicycle_crunches:   { id: "IZVHb27", name: "Walking Lunge",            target: "Abs & Obliques",     bodyPart: "Full Body", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/IZVHb27.gif" },
  leg_raises:         { id: "hCjGsRQ", name: "Power Point Plank",        target: "Lower Abs",          bodyPart: "Full Body", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/hCjGsRQ.gif" },
  russian_twists:     { id: "TFqbd8t", name: "Crunch (Floor)",           target: "Obliques",           bodyPart: "Full Body", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/TFqbd8t.gif" },
  dead_bug:           { id: "RJgzwny", name: "Mountain Climber",         target: "Deep Core",          bodyPart: "Full Body", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/RJgzwny.gif" },
  side_plank:         { id: "1g5bPpA", name: "Jack Jump",                target: "Obliques",           bodyPart: "Full Body", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/1g5bPpA.gif" },
  toe_touches:        { id: "dK9394r", name: "Burpee",                   target: "Upper Abs",          bodyPart: "Full Body", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/dK9394r.gif" },

  // ── Shoulders (5 exercises · 5 unique GIFs) ──
  pike_pushups:         { id: "01qpYSe", name: "Upward Facing Dog",       target: "Deltoids",           bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/01qpYSe.gif" },
  plank_shoulder_taps:  { id: "05Cf2v8", name: "Impossible Dips",        target: "Deltoids & Core",    bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/05Cf2v8.gif" },
  bear_crawl:           { id: "11wrviz", name: "Isometric Wipers",       target: "Deltoids & Core",    bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/11wrviz.gif" },
  inchworm:             { id: "0br45wL", name: "Push-Up Inside Leg Kick",target: "Deltoids & Hamstrings", bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0br45wL.gif" },
  crab_reach:           { id: "13TpY4H", name: "Raise Single Arm Push-Up",target: "Deltoids & Thoracic", bodyPart: "Shoulders", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/13TpY4H.gif" },

  // ── Back (7 exercises · 7 unique GIFs) ──
  cat_cow_stretch:      { id: "0mB6wHO", name: "Runners Stretch",        target: "Spinal Erectors",    bodyPart: "Back", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0mB6wHO.gif" },
  superman_hold:        { id: "0rHfvy9", name: "Inverse Leg Curl",       target: "Erector Spinae",     bodyPart: "Back", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0rHfvy9.gif" },
  bird_dog:             { id: "0V2YQjW", name: "Pull Up Neutral Grip",   target: "Erector Spinae",     bodyPart: "Back", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0V2YQjW.gif" },
  reverse_snow_angels:  { id: "13TpY4H", name: "Raise Single Arm Push-Up",target: "Rhomboids",         bodyPart: "Back", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/13TpY4H.gif" },
  wall_angels:          { id: "17bqEXD", name: "Seated Calf Stretch",    target: "Lower Traps",        bodyPart: "Back", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/17bqEXD.gif" },
  scapular_pushups:     { id: "DFGXwZr", name: "World Greatest Stretch", target: "Serratus Anterior",  bodyPart: "Back", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/DFGXwZr.gif" },
  prone_cobra:          { id: "0jp9Rlz", name: "One Leg Floor Calf Raise",target: "Erector Spinae",    bodyPart: "Back", equipment: "Body Weight", gifUrl: "https://static.exercisedb.dev/media/0jp9Rlz.gif" },
};

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

// Name-to-key lookup so the resolver can find per-exercise GIFs by display name.
// Keys are normalised (lowercase, non-alphanumeric → underscore, trimmed).
const _NAME_TO_KEY: Record<string, string> = {
  standard_push_up:         "pushups",
  wide_grip_push_up:        "wide_pushups",
  decline_push_up:          "decline_pushups",
  diamond_push_up:          "diamond_pushups",
  archer_push_up:           "archer_pushups",
  hindu_push_up:            "hindu_pushups",
  tricep_dips_chair:        "tricep_dips_chair",
  tricep_dips:              "tricep_dips_chair",
  close_grip_push_up:       "close_grip_pushups",
  plank_up_downs:           "plank_updowns",
  bodyweight_tricep_extension: "tricep_extensions",
  push_up_to_shoulder_tap:  "shoulder_tap_pushup",
  bodyweight_deep_squat:    "air_squats",
  alternating_reverse_lunge:"reverse_lunges",
  bulgarian_split_squat:    "bulgarian_split_squat",
  wall_sit_hold:            "wall_sit",
  standing_calf_raises:     "calf_raises",
  single_leg_glute_bridge:  "glute_bridge",
  sumo_squat:               "sumo_squats",
  lateral_lunge:            "lateral_lunges",
  jump_squat:               "jump_squats",
  forearm_core_plank:       "plank_hold",
  mountain_climbers:        "mountain_climbers",
  bicycle_crunches:         "bicycle_crunches",
  lying_leg_raises:         "leg_raises",
  russian_twists:           "russian_twists",
  dead_bug:                 "dead_bug",
  side_plank_hold:          "side_plank",
  lying_toe_touches:        "toe_touches",
  pike_push_up:             "pike_pushups",
  plank_shoulder_taps:      "plank_shoulder_taps",
  bear_crawl:               "bear_crawl",
  inchworm_walk_out:        "inchworm",
  crab_reach:               "crab_reach",
  cat_cow_stretch:          "cat_cow_stretch",
  superman_hold:            "superman_hold",
  bird_dog:                 "bird_dog",
  reverse_snow_angels:      "reverse_snow_angels",
  wall_angels:              "wall_angels",
  scapular_push_up:         "scapular_pushups",
  prone_cobra_hold:         "prone_cobra",
};

/** Normalise an exercise display name into a map-safe key. */
function normaliseExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

// Resolve the best ExerciseDB GIF by name, animationType, or target muscle.
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

  // 2. Catalogue by animationType
  if (animLower && EXERCISE_DB_CATALOG[animLower]) {
    return EXERCISE_DB_CATALOG[animLower];
  }

  if (nameLower.includes("push") || nameLower.includes("chest")) return EXERCISE_DB_CATALOG.pushup;
  if (nameLower.includes("squat") || nameLower.includes("leg")) return EXERCISE_DB_CATALOG.squat;
  if (nameLower.includes("plank") || nameLower.includes("core")) return EXERCISE_DB_CATALOG.plank;
  if (nameLower.includes("lunge")) return EXERCISE_DB_CATALOG.lunge;
  if (nameLower.includes("jack") || nameLower.includes("jump")) return EXERCISE_DB_CATALOG.jumping_jacks;
  if (nameLower.includes("climb") || nameLower.includes("mountain")) return EXERCISE_DB_CATALOG.mountain_climbers;
  if (nameLower.includes("burpee")) return EXERCISE_DB_CATALOG.burpees;
  if (nameLower.includes("crunch") || nameLower.includes("ab")) return EXERCISE_DB_CATALOG.crunch;
  if (nameLower.includes("stretch") || nameLower.includes("yoga") || nameLower.includes("warm")) return EXERCISE_DB_CATALOG.stretching;

  if (muscleLower.includes("chest") || muscleLower.includes("tricep")) return EXERCISE_DB_CATALOG.pushup;
  if (muscleLower.includes("quad") || muscleLower.includes("glute")) return EXERCISE_DB_CATALOG.squat;
  if (muscleLower.includes("abs") || muscleLower.includes("waist")) return EXERCISE_DB_CATALOG.plank;

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
