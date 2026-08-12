import { Badge, UserProfile } from "../types";

// Derives the full achievement collection from live profile data every time it changes.
// A badge is "unlocked" when its condition is met; progressPercent shows how close you are.
export function computeBadges(user: UserProfile): Badge[] {
  const workoutLogs = user.workoutLogs || [];
  const weightLogs = user.weightLogs || [];

  const workoutCount = workoutLogs.length;
  const totalCalories = workoutLogs.reduce((sum, log) => sum + (log.caloriesBurned || 0), 0);
  const totalMins = workoutLogs.reduce((sum, log) => sum + (log.minutes || 0), 0);
  const streak = user.streakDays || 0;
  const waterPct = Math.min(
    100,
    Math.round((user.waterIntakeMl / ((user.waterGoalLiters || 3) * 1000)) * 100)
  );

  // Progress toward the target body transformation (target weight from signup).
  const startW = weightLogs[0]?.weightKg ?? user.weightKg;
  const currentW = weightLogs[weightLogs.length - 1]?.weightKg ?? user.weightKg;
  const targetW = user.targetWeightKg ?? startW;
  const changeNeeded = startW - targetW;
  const changeMade = startW - currentW;
  const transformPct =
    changeNeeded === 0 ? 0 : Math.round((changeMade / changeNeeded) * 100);

  const define = (
    id: string,
    name: string,
    description: string,
    iconName: string,
    unlocked: boolean,
    progressPercent: number
  ): Badge => ({
    id,
    name,
    description,
    iconName,
    unlocked,
    unlockedAt: unlocked ? user.joinedDate : undefined,
    progressPercent: Math.max(0, Math.min(100, Math.round(progressPercent))),
  });

  return [
    // First steps
    define(
      "first_sweat",
      "First Sweat",
      "Complete your very first AI-guided workout session.",
      "Dumbbell",
      workoutCount >= 1,
      (workoutCount / 1) * 100
    ),
    define(
      "transformation_started",
      "Transformation Started",
      "Log a second weigh-in to begin tracking your transformation.",
      "Scale",
      weightLogs.length >= 2,
      (weightLogs.length / 2) * 100
    ),

    // Daily streak
    define(
      "streak_3",
      "3-Day Igniter",
      "Keep a 3-day active streak alive.",
      "Flame",
      streak >= 3,
      (streak / 3) * 100
    ),
    define(
      "streak_7",
      "7-Day Warrior",
      "Maintain a 7-day uninterrupted streak.",
      "Zap",
      streak >= 7,
      (streak / 7) * 100
    ),
    define(
      "streak_14",
      "14-Day Machine",
      "Stay locked in for 14 straight days.",
      "Flame",
      streak >= 14,
      (streak / 14) * 100
    ),
    define(
      "streak_30",
      "30-Day Legend",
      "Hold a 30-day streak. Absolute legend.",
      "Crown",
      streak >= 30,
      (streak / 30) * 100
    ),

    // Workout consistency
    define(
      "workout_5",
      "Getting Serious",
      "Complete 5 AI-guided workouts.",
      "Dumbbell",
      workoutCount >= 5,
      (workoutCount / 5) * 100
    ),
    define(
      "workout_10",
      "Consistency King",
      "Complete 10 AI-guided workouts.",
      "Medal",
      workoutCount >= 10,
      (workoutCount / 10) * 100
    ),
    define(
      "workout_25",
      "Iron Will",
      "Complete 25 AI-guided workouts.",
      "Trophy",
      workoutCount >= 25,
      (workoutCount / 25) * 100
    ),
    define(
      "workout_50",
      "Unstoppable",
      "Complete 50 AI-guided workouts.",
      "Star",
      workoutCount >= 50,
      (workoutCount / 50) * 100
    ),
    define(
      "hours_5",
      "5-Hour Grind",
      "Log 5 total hours of training.",
      "Activity",
      totalMins >= 300,
      (totalMins / 300) * 100
    ),

    // Calorie burn
    define(
      "calories_500",
      "500 Calorie Crusher",
      "Burn 500 calories through AI workouts.",
      "Flame",
      totalCalories >= 500,
      (totalCalories / 500) * 100
    ),
    define(
      "calories_2500",
      "Calorie Incinerator",
      "Burn 2,500 calories in total.",
      "Zap",
      totalCalories >= 2500,
      (totalCalories / 2500) * 100
    ),
    define(
      "calories_10000",
      "10K Burner",
      "Burn 10,000 calories in total.",
      "Trophy",
      totalCalories >= 10000,
      (totalCalories / 10000) * 100
    ),

    // Hydration
    define(
      "hydration_hero",
      "Hydration Hero",
      "Hit 100% of your daily water intake goal.",
      "Droplet",
      waterPct >= 100,
      waterPct
    ),

    // Body transformation progress
    define(
      "transform_25",
      "Quarter Milestone",
      "Make it 25% of the way to your target body.",
      "TrendingUp",
      transformPct >= 25,
      transformPct
    ),
    define(
      "transform_50",
      "Halfway Hero",
      "You are 50% of the way to your target body.",
      "Activity",
      transformPct >= 50,
      transformPct
    ),
    define(
      "transform_75",
      "Almost There",
      "Reach 75% of your transformation goal.",
      "Target",
      transformPct >= 75,
      transformPct
    ),
    define(
      "transform_100",
      "Transformation Complete",
      "Reach your target weight and complete the journey.",
      "Award",
      transformPct >= 100,
      transformPct
    ),

    // XP & level
    define(
      "xp_500",
      "Rising Star",
      "Earn 500 total XP.",
      "Star",
      user.xp >= 500,
      (user.xp / 500) * 100
    ),
    define(
      "xp_2000",
      "Fitness Pro",
      "Earn 2,000 total XP.",
      "Crown",
      user.xp >= 2000,
      (user.xp / 2000) * 100
    ),
    define(
      "level_5",
      "Level 5 Athlete",
      "Reach level 5.",
      "ShieldCheck",
      (user.level || 1) >= 5,
      ((user.level || 1) / 5) * 100
    ),
  ];
}
