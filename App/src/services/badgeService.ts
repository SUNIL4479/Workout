import { Badge, BadgeCategory, UserProfile } from "../types";

export const CATEGORY_META: Record<BadgeCategory, { label: string; color: string; icon: string; bg: string }> = {
  streak: { label: "Streaks", color: "#f97316", icon: "🔥", bg: "#fff7ed" },
  milestone: { label: "Milestones", color: "#0055ff", icon: "🎯", bg: "#e6f0ff" },
  burn: { label: "Calorie Burns", color: "#f59e0b", icon: "⚡", bg: "#fefce8" },
  transform: { label: "Transformation", color: "#8b5cf6", icon: "✨", bg: "#f5f3ff" },
  lifestyle: { label: "Lifestyle", color: "#14b8a6", icon: "💧", bg: "#f0fdfa" },
  rank: { label: "Ranks", color: "#10b981", icon: "⭐", bg: "#ecfdf5" },
};

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

  const startW = weightLogs[0]?.weightKg ?? user.weightKg;
  const currentW = weightLogs[weightLogs.length - 1]?.weightKg ?? user.weightKg;
  const targetW = user.targetWeightKg ?? startW;
  const changeNeeded = startW - targetW;
  const changeMade = startW - currentW;
  const transformPct = changeNeeded === 0 ? 0 : Math.round((changeMade / changeNeeded) * 100);

  const define = (
    id: string,
    name: string,
    description: string,
    iconName: string,
    category: BadgeCategory,
    unlocked: boolean,
    progressPercent: number
  ): Badge => ({
    id,
    name,
    description,
    iconName,
    category,
    unlocked,
    unlockedAt: unlocked ? user.joinedDate : undefined,
    progressPercent: Math.max(0, Math.min(100, Math.round(progressPercent))),
  });

  return [
    define("first_sweat", "First Sweat", "Complete your very first AI-guided workout session.", "🏋️", "milestone", workoutCount >= 1, (workoutCount / 1) * 100),
    define("workout_5", "Getting Serious", "Complete 5 AI-guided workouts.", "💪", "milestone", workoutCount >= 5, (workoutCount / 5) * 100),
    define("workout_10", "Consistency King", "Complete 10 AI-guided workouts.", "👑", "milestone", workoutCount >= 10, (workoutCount / 10) * 100),
    define("workout_25", "Iron Will", "Complete 25 AI-guided workouts.", "🏅", "milestone", workoutCount >= 25, (workoutCount / 25) * 100),
    define("workout_50", "Unstoppable", "Complete 50 AI-guided workouts.", "🏆", "milestone", workoutCount >= 50, (workoutCount / 50) * 100),
    define("hours_5", "5-Hour Grind", "Log 5 total hours of training.", "⏱️", "milestone", totalMins >= 300, (totalMins / 300) * 100),

    define("streak_3", "3-Day Igniter", "Keep a 3-day active streak alive.", "🔥", "streak", streak >= 3, (streak / 3) * 100),
    define("streak_7", "7-Day Warrior", "Maintain a 7-day uninterrupted streak.", "⚔️", "streak", streak >= 7, (streak / 7) * 100),
    define("streak_14", "14-Day Machine", "Stay locked in for 14 straight days.", "🤖", "streak", streak >= 14, (streak / 14) * 100),
    define("streak_30", "30-Day Legend", "Hold a 30-day streak. Absolute legend.", "🏆", "streak", streak >= 30, (streak / 30) * 100),

    define("calories_500", "500 Cal Crusher", "Burn 500 calories through AI workouts.", "🔥", "burn", totalCalories >= 500, (totalCalories / 500) * 100),
    define("calories_2500", "Calorie Incinerator", "Burn 2,500 calories in total.", "⚡", "burn", totalCalories >= 2500, (totalCalories / 2500) * 100),
    define("calories_10000", "10K Burner", "Burn 10,000 calories in total.", "🌋", "burn", totalCalories >= 10000, (totalCalories / 10000) * 100),

    define("transformation_started", "First Step", "Log a second weigh-in to begin tracking your transformation.", "📏", "transform", weightLogs.length >= 2, (weightLogs.length / 2) * 100),
    define("transform_25", "Quarter Way", "25% of the way to your target body.", "🌟", "transform", transformPct >= 25, transformPct),
    define("transform_50", "Halfway Hero", "50% of the way to your target body.", "💫", "transform", transformPct >= 50, transformPct),
    define("transform_75", "Almost There", "75% of your transformation goal.", "🎯", "transform", transformPct >= 75, transformPct),
    define("transform_101", "Full Transformation", "Reached your target weight. Journey complete.", "✨", "transform", transformPct >= 100, transformPct),

    define("hydration_hero", "Hydration Hero", "Hit 100% of your daily water intake goal.", "💧", "lifestyle", waterPct >= 100, waterPct),

    define("xp_500", "Rising Star", "Earn 500 total XP.", "⭐", "rank", user.xp >= 500, (user.xp / 500) * 100),
    define("xp_2000", "Fitness Pro", "Earn 2,000 total XP.", "🎖️", "rank", user.xp >= 2000, (user.xp / 2000) * 100),
    define("level_5", "Level 5 Athlete", "Reach level 5.", "🛡️", "rank", (user.level || 1) >= 5, ((user.level || 1) / 5) * 100),
  ];
}
