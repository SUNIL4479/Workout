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

  // 1. Direct catalog key match (verified curated GIF)
  if (animLower && EXERCISE_DB_CATALOG[animLower]) {
    return EXERCISE_DB_CATALOG[animLower];
  }

  // 2. Name search matching against the curated catalog
  if (nameLower.includes("push") || nameLower.includes("chest")) return EXERCISE_DB_CATALOG.pushup;
  if (nameLower.includes("squat") || nameLower.includes("leg")) return EXERCISE_DB_CATALOG.squat;
  if (nameLower.includes("plank") || nameLower.includes("core")) return EXERCISE_DB_CATALOG.plank;
  if (nameLower.includes("lunge")) return EXERCISE_DB_CATALOG.lunge;
  if (nameLower.includes("jack") || nameLower.includes("jump")) return EXERCISE_DB_CATALOG.jumping_jacks;
  if (nameLower.includes("climb") || nameLower.includes("mountain")) return EXERCISE_DB_CATALOG.mountain_climbers;
  if (nameLower.includes("burpee")) return EXERCISE_DB_CATALOG.burpees;
  if (nameLower.includes("crunch") || nameLower.includes("ab")) return EXERCISE_DB_CATALOG.crunch;
  if (nameLower.includes("stretch") || nameLower.includes("yoga") || nameLower.includes("warm")) return EXERCISE_DB_CATALOG.stretching;

  // 3. Muscle group fallback against the curated catalog
  if (muscleLower.includes("chest") || muscleLower.includes("tricep")) return EXERCISE_DB_CATALOG.pushup;
  if (muscleLower.includes("quad") || muscleLower.includes("glute")) return EXERCISE_DB_CATALOG.squat;
  if (muscleLower.includes("abs") || muscleLower.includes("waist")) return EXERCISE_DB_CATALOG.plank;

  // 4. Live cache as a last resort — only for strong, exact-ish matches so a wrong
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
