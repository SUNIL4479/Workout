import { UserProfile, WorkoutPlan, Exercise } from "../types";
import { DETAILED_EXERCISE_DATABASE, DetailedExercise, getExercisesByBodyPart } from "./exerciseService";

export interface WorkoutPerformanceFeedback {
  workoutId: string;
  completedReps: number;
  skippedExercisesCount: number;
  totalDurationMin: number;
  userRating: 1 | 2 | 3 | 4 | 5; // 1 = Too Easy, 3 = Optimal, 5 = Too Hard
  energyLevel: "Low" | "Medium" | "High";
  sorenessFeedback?: string;
  completedAt: string;
}

export class WorkoutService {
  private static performanceHistory: WorkoutPerformanceFeedback[] = [];

  /**
   * Generates a safe, personalized workout plan strictly mapped to validated exercise IDs & motion demonstrations.
   */
  static generatePersonalizedWorkout(
    user: UserProfile,
    customGoal?: string,
    durationMin: number = 20,
    equipment: string = "No equipment"
  ): WorkoutPlan {
    const level = user.experience || "beginner";
    const medical = user.medicalLimitations?.toLowerCase() || "";

    // Filter exercises safe for medical limitations
    let safeExercises = DETAILED_EXERCISE_DATABASE.filter((ex) => {
      if ((medical.includes("knee") || medical.includes("joint")) && (ex.id === "burpee" || ex.id === "jumping_jacks")) {
        return false;
      }
      if (medical.includes("wrist") && ex.id === "burpee") {
        return false;
      }
      return true;
    });

    if (safeExercises.length < 3) {
      safeExercises = DETAILED_EXERCISE_DATABASE;
    }

    // Adapt sets & reps based on previous performance history
    const recentFeedback = this.performanceHistory[this.performanceHistory.length - 1];
    let repMultiplier = 1.0;

    if (recentFeedback) {
      if (recentFeedback.userRating === 1) {
        repMultiplier = 1.15;
      } else if (recentFeedback.userRating === 5) {
        repMultiplier = 0.8;
      }
    }

    const usedIds = new Set<string>();

    const warmUpEx = safeExercises.find((e) => e.category === "Mobility" && !usedIds.has(e.id)) || safeExercises.find((e) => !usedIds.has(e.id)) || safeExercises[0];
    usedIds.add(warmUpEx.id);
    const mainExList = safeExercises.filter((e) => e.category !== "Mobility" && !usedIds.has(e.id)).slice(0, 4);
    mainExList.forEach((e) => usedIds.add(e.id));
    const coolDownEx = safeExercises.find((e) => e.category === "Mobility" && !usedIds.has(e.id)) || safeExercises.find((e) => !usedIds.has(e.id)) || safeExercises[0];

    const convertToExercise = (ex: DetailedExercise): Exercise => ({
      id: ex.id,
      name: ex.name,
      targetMuscles: ex.targetMuscles,
      reps: ex.recommendedReps ? Math.round(ex.recommendedReps * repMultiplier) : undefined,
      durationSec: ex.recommendedDuration ? Math.round(ex.recommendedDuration * repMultiplier) : undefined,
      sets: 3,
      restSec: ex.difficulty === "Advanced" ? 30 : 25,
      calories: Math.round((ex.recommendedReps || ex.recommendedDuration || 30) * 0.8),
      instructions: ex.executionSteps.join(" "),
      safetyTips: ex.safetyNotes,
      formCues: ex.commonMistakes[0] ? `Avoid: ${ex.commonMistakes[0]}` : "Keep core tight",
      animationType: ex.animationType,
      difficulty: ex.difficulty,
    });

    return {
      id: `ai_workout_${Date.now()}`,
      title: customGoal ? `${customGoal} (${durationMin}m)` : `${durationMin}-Min AI Personalized ${level.toUpperCase()} Workout`,
      description: `Personalized ${durationMin}-minute routine tailored for ${user.goal} and ${level} level. Synchronized with motion demonstrations and AI Voice Coach.`,
      category: level === "advanced" ? "Strength" : "Fat Burn",
      totalMinutes: durationMin,
      estimatedCalories: Math.round(durationMin * 8.5 * repMultiplier),
      difficulty: level === "advanced" ? "Advanced" : level === "intermediate" ? "Intermediate" : "Beginner",
      safetyAdvice: medical ? `Safety Alert: Adapted for "${user.medicalLimitations}".` : "Land softly on balls of feet and maintain steady hydration.",
      warmUp: [convertToExercise(warmUpEx)],
      mainRoutine: mainExList.map(convertToExercise),
      coolDown: [convertToExercise(coolDownEx)],
    };
  }

  /**
   * Generates a workout plan from the local exercise database filtered by body part.
   * No AI call — deterministic results that always match the selected body part.
   */
  static generateBodyPartWorkout(
    user: UserProfile,
    bodyPart: string,
    durationMin: number = 20
  ): WorkoutPlan {
    const level = user.experience || "beginner";
    const medical = user.medicalLimitations?.toLowerCase() || "";

    const allMatching = getExercisesByBodyPart(bodyPart);

    // Filter by medical limitations
    let safeExercises = allMatching.filter((ex) => {
      if ((medical.includes("knee") || medical.includes("joint")) && (ex.id === "burpee" || ex.id === "jumping_jacks" || ex.id === "jump_squats")) {
        return false;
      }
      if (medical.includes("wrist") && (ex.id === "burpee" || ex.id === "plank_updowns")) {
        return false;
      }
      if (medical.includes("back") && (ex.id === "superman_hold" || ex.id === "prone_cobra")) {
        return false;
      }
      return true;
    });

    if (safeExercises.length < 2) {
      safeExercises = allMatching;
    }

    // Performance adaptation
    const recentFeedback = this.performanceHistory[this.performanceHistory.length - 1];
    let repMultiplier = 1.0;
    if (recentFeedback) {
      if (recentFeedback.userRating === 1) repMultiplier = 1.15;
      else if (recentFeedback.userRating === 5) repMultiplier = 0.8;
    }

    // Track used IDs to prevent duplicates across phases
    const usedIds = new Set<string>();
    // Track used animation types to ensure visual variety
    const usedAnimTypes = new Set<string>();

    const pickUnique = (pool: DetailedExercise[], count: number): DetailedExercise[] => {
      const available = pool.filter((e) => !usedIds.has(e.id));
      if (available.length === 0) return [];

      // Prefer exercises with animation types not yet used (visual diversity)
      const unseen = available.filter((e) => !usedAnimTypes.has(e.animationType));
      const ranked = unseen.length > 0 ? unseen : available;

      const picked: DetailedExercise[] = [];
      const shuffled = shuffle(ranked);
      for (const ex of shuffled) {
        if (picked.length >= count) break;
        picked.push(ex);
        usedIds.add(ex.id);
        usedAnimTypes.add(ex.animationType);
      }
      return picked;
    };

    // Separate pools by category for warm-up / cool-down
    const mobility = safeExercises.filter((e) => e.category === "Mobility");
    const nonMobility = safeExercises.filter((e) => e.category !== "Mobility");

    const warmUpPool = mobility.length > 0 ? mobility : safeExercises;
    const warmUpExercises = pickUnique(warmUpPool, Math.min(2, warmUpPool.length));

    const mainPool = nonMobility.length > 0 ? nonMobility : safeExercises;
    const mainExercises = pickUnique(mainPool, Math.min(5, mainPool.length));

    // Cool-down: allow mobility again but exclude already-used IDs
    const coolDownPool = (mobility.length > 0 ? mobility : safeExercises).filter((e) => !usedIds.has(e.id));
    const coolDownExercises = coolDownPool.length > 0
      ? pickUnique(coolDownPool, Math.min(2, coolDownPool.length))
      // Fallback: if all mobility are used, pick from any remaining exercises
      : pickUnique(safeExercises, Math.min(2, safeExercises.length));

    const convertToExercise = (ex: DetailedExercise): Exercise => ({
      id: ex.id,
      name: ex.name,
      targetMuscles: ex.targetMuscles,
      reps: ex.recommendedReps ? Math.round(ex.recommendedReps * repMultiplier) : undefined,
      durationSec: ex.recommendedDuration ? Math.round(ex.recommendedDuration * repMultiplier) : undefined,
      sets: 3,
      restSec: ex.difficulty === "Advanced" ? 30 : 25,
      calories: Math.round((ex.recommendedReps || ex.recommendedDuration || 30) * 0.8),
      instructions: ex.executionSteps.join(" "),
      safetyTips: ex.safetyNotes,
      formCues: ex.commonMistakes[0] ? `Avoid: ${ex.commonMistakes[0]}` : "Keep core tight",
      animationType: ex.animationType,
      difficulty: ex.difficulty,
    });

    return {
      id: `bodypart_${bodyPart.toLowerCase()}_${Date.now()}`,
      title: `${bodyPart} Focus Workout (${durationMin}m)`,
      description: `${durationMin}-minute targeted ${bodyPart.toLowerCase()} workout with ${safeExercises.length} available exercises. Tailored for ${level} level.`,
      category: bodyPart === "Full Body" ? "Full Body & Core" : "Muscle Sculpt",
      totalMinutes: durationMin,
      estimatedCalories: Math.round(durationMin * 8.5 * repMultiplier),
      difficulty: level === "advanced" ? "Advanced" : level === "intermediate" ? "Intermediate" : "Beginner",
      safetyAdvice: medical ? `Safety Alert: Adapted for "${user.medicalLimitations}".` : `Focus on proper ${bodyPart.toLowerCase()} engagement and controlled movement.`,
      warmUp: warmUpExercises.map(convertToExercise),
      mainRoutine: mainExercises.map(convertToExercise),
      coolDown: coolDownExercises.map(convertToExercise),
    };
  }

  /**
   * Performance Adaptation Engine: Records workout completion metrics & adapts user stats.
   */
  static recordWorkoutPerformance(feedback: WorkoutPerformanceFeedback) {
    this.performanceHistory.push(feedback);
  }

  static getPerformanceHistory() {
    return this.performanceHistory;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
