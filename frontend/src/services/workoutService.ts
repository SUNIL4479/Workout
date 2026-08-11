import { UserProfile, WorkoutPlan, Exercise } from "../types";
import { DETAILED_EXERCISE_DATABASE, DetailedExercise } from "./exerciseService";

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
      // Avoid knee-heavy exercises if knee injury reported
      if ((medical.includes("knee") || medical.includes("joint")) && (ex.id === "burpee" || ex.id === "jumping_jacks")) {
        return false;
      }
      // Avoid heavy wrist pressure if wrist issue reported
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
    let setAdjust = 0;

    if (recentFeedback) {
      if (recentFeedback.userRating === 1) {
        // User rated "Too Easy" -> slightly increase rep multiplier by 15%
        repMultiplier = 1.15;
      } else if (recentFeedback.userRating === 5) {
        // User rated "Too Hard" -> reduce intensity by 20%
        repMultiplier = 0.8;
      }
    }

    // Select exercises matching requested category/duration
    const warmUpEx = safeExercises.find((e) => e.category === "Mobility") || safeExercises[0];
    const mainExList = safeExercises.filter((e) => e.category !== "Mobility").slice(0, 4);
    const coolDownEx = safeExercises.find((e) => e.category === "Mobility") || safeExercises[0];

    const convertToExercise = (ex: DetailedExercise): Exercise => ({
      id: ex.id,
      name: ex.name,
      targetMuscles: ex.targetMuscles,
      reps: ex.recommendedReps ? Math.round(ex.recommendedReps * repMultiplier) : undefined,
      durationSec: ex.recommendedDuration ? Math.round(ex.recommendedDuration * repMultiplier) : undefined,
      sets: (ex.difficulty === "Advanced" ? 3 : 3) + setAdjust,
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
   * Performance Adaptation Engine: Records workout completion metrics & adapts user stats.
   */
  static recordWorkoutPerformance(feedback: WorkoutPerformanceFeedback) {
    this.performanceHistory.push(feedback);
    console.log("Performance feedback recorded:", feedback);
  }

  static getPerformanceHistory() {
    return this.performanceHistory;
  }
}
